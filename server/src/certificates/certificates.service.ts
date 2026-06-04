import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider";
import {
  certificates,
  certificateTemplates,
  courses,
  users,
} from "../database/schema";
import { eq, and } from "drizzle-orm";
import * as crypto from "crypto";

@Injectable()
export class CertificatesService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async findByUser(userId: string) {
    return this.db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId));
  }

  async findById(id: string) {
    const [cert] = await this.db
      .select()
      .from(certificates)
      .where(eq(certificates.id, id))
      .limit(1);
    if (!cert) throw new NotFoundException("Certificate not found");
    return cert;
  }

  async verifyByHash(hash: string) {
    const [cert] = await this.db
      .select()
      .from(certificates)
      .where(eq(certificates.verificationHash, hash))
      .limit(1);
    if (!cert) throw new NotFoundException("Certificate not found or invalid");
    return cert;
  }

  async generate(userId: string, courseId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw new NotFoundException("User not found");

    const [course] = await this.db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    if (!course) throw new NotFoundException("Course not found");

    const [template] = await this.db
      .select()
      .from(certificateTemplates)
      .where(eq(certificateTemplates.isDefault, true))
      .limit(1);

    if (!template) throw new NotFoundException("No default certificate template found");

    const certificateNumber = `CERT-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const verificationHash = crypto
      .createHash("sha256")
      .update(`${userId}-${courseId}-${Date.now()}`)
      .digest("hex");

    const [cert] = await this.db
      .insert(certificates)
      .values({
        userId,
        courseId,
        templateId: template.id,
        certificateNumber,
        studentName: user.name,
        courseName: course.title,
        completionDate: new Date(),
        verificationHash,
      })
      .returning();
    return cert;
  }
}