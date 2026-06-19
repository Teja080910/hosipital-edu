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
import { I18nService } from "../common/i18n/i18n.service";

@Injectable()
export class CertificatesService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
  ) {}

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
    if (!cert) throw new NotFoundException(this.i18n.t("certificates.notFound"));
    return cert;
  }

  async verifyByHash(hash: string) {
    const [cert] = await this.db
      .select()
      .from(certificates)
      .where(eq(certificates.verificationHash, hash))
      .limit(1);
    if (!cert) throw new NotFoundException(this.i18n.t("certificates.notFound"));
    return cert;
  }

  async generate(userId: string, courseId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw new NotFoundException(this.i18n.t("certificates.userNotFound"));

    const [course] = await this.db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    if (!course) throw new NotFoundException(this.i18n.t("certificates.courseNotFound"));

    const [template] = await this.db
      .select()
      .from(certificateTemplates)
      .where(eq(certificateTemplates.isDefault, true))
      .limit(1);

    if (!template) throw new NotFoundException(this.i18n.t("certificates.noDefaultTemplate"));

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