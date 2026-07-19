import { Injectable, Inject, NotFoundException, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DRIZZLE } from "../database/database.provider";
import {
  certificates,
  certificateTemplates,
  courses,
  courseLessons,
  courseModules,
  userCourseProgress,
  userCourseEnrollments,
  users,
} from "../database/schema";
import { UploadService } from "../upload/upload.service";
import { eq, and, sql } from "drizzle-orm";
import * as crypto from "crypto";
import * as PDFDocument from "pdfkit";
import * as QRCode from "qrcode";
import { I18nService } from "../common/i18n/i18n.service";

@Injectable()
export class CertificatesService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private i18n: I18nService,
    private config: ConfigService,
    private uploadService: UploadService,
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

    const [enrollment] = await this.db
      .select()
      .from(userCourseEnrollments)
      .where(
        and(
          eq(userCourseEnrollments.userId, userId),
          eq(userCourseEnrollments.courseId, courseId),
          eq(userCourseEnrollments.status, "active"),
        ),
      )
      .limit(1);
    if (!enrollment) throw new BadRequestException("Not enrolled in this course");

    const progressRows = await this.db
      .select()
      .from(userCourseProgress)
      .where(and(
        eq(userCourseProgress.userId, userId),
        eq(userCourseProgress.courseId, courseId),
      ));

    const [totalResult] = await this.db
      .select({ total: sql<number>`count(${courseLessons.id})::int` })
      .from(courseLessons)
      .innerJoin(courseModules, eq(courseLessons.moduleId, courseModules.id))
      .where(eq(courseModules.courseId, courseId));

    const completedCount = progressRows.filter((r: any) => r.isCompleted).length;
    const totalLessons = totalResult?.total || 0;

    if (totalLessons === 0 || completedCount < totalLessons) {
      throw new BadRequestException("Course not yet completed");
    }

    const [template] = await this.db
      .select()
      .from(certificateTemplates)
      .where(eq(certificateTemplates.isDefault, true))
      .limit(1);

    if (!template) throw new NotFoundException(this.i18n.t("certificates.noDefaultTemplate"));

    const certificateNumber = `CERT-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const secret = this.config.get<string>("CERTIFICATE_HMAC_SECRET") || "cert-default-secret";
    const verificationHash = crypto
      .createHmac("sha256", secret)
      .update(`${userId}-${courseId}-${certificateNumber}`)
      .digest("hex");

    const appUrl = this.config.get<string>("APP_URL") || "http://localhost:4175";
    const verificationUrl = `${appUrl}/certificates/verify/${verificationHash}`;

    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      type: "png",
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    const qrKey = `certificates/qr/${certificateNumber}.png`;
    const qrUpload = await this.uploadService.uploadFile(qrKey, "image/png", qrBuffer);

    const pdfBuffer = await this.generateCertificatePdf({
      studentName: user.name,
      courseName: course.title,
      completionDate: new Date(),
      certificateNumber,
      qrBuffer,
      template,
    });

    const pdfKey = `certificates/pdf/${certificateNumber}.pdf`;
    const pdfUpload = await this.uploadService.uploadFile(pdfKey, "application/pdf", pdfBuffer);

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
        qrCodeUrl: qrUpload.url,
        pdfUrl: pdfUpload.url,
      })
      .returning();
    return cert;
  }

  private generateCertificatePdf(data: {
    studentName: string;
    courseName: any;
    completionDate: Date;
    certificateNumber: string;
    qrBuffer: Buffer;
    template: any;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        info: {
          Title: `Certificate - ${data.studentName}`,
          Author: "MD Exam",
        },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const pw = doc.page.width;
      const ph = doc.page.height;
      const textColor = data.template.textColor || "#1e3a5f";

      doc.rect(20, 20, pw - 40, ph - 40).lineWidth(3).stroke("#1e40af");
      doc.rect(28, 28, pw - 56, ph - 56).lineWidth(1).stroke("#93c5fd");

      doc.moveDown(3);
      doc.fontSize(40).fillColor(textColor).text("Certificate of Completion", { align: "center" });

      doc.moveDown(1.5);
      doc.fontSize(18).fillColor("#666666").text("This is to certify that", { align: "center" });

      doc.moveDown(1.5);
      doc.font("Helvetica-Bold").fontSize(44).fillColor("#1e40af").text(data.studentName, { align: "center" });

      doc.font("Helvetica").moveDown(1.5);
      doc.fontSize(18).fillColor("#666666").text("has successfully completed the course", { align: "center" });

      doc.moveDown(1.5);
      doc.font("Helvetica-Bold").fontSize(28).fillColor(textColor).text(
        data.courseName?.en || data.courseName?.es || "Course",
        { align: "center" },
      );

      doc.moveDown(2);
      const formattedDate = data.completionDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.font("Helvetica").fontSize(14).fillColor("#666666").text(`Date: ${formattedDate}`, { align: "center" });

      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#999999").text(`Certificate No: ${data.certificateNumber}`, { align: "center" });

      const qrSize = 100;
      const qrX = pw - qrSize - 60;
      const qrY = ph - qrSize - 60;
      doc.image(data.qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

      doc.end();
    });
  }
}