import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>("RESEND_API_KEY");
    if (apiKey && apiKey !== "re_placeholder") {
      this.resend = new Resend(apiKey);
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      return { message: "Mail not configured - skipping send", to, subject };
    }
    return this.resend.emails.send({
      from: this.config.get<string>("MAIL_FROM", "noreply@hospital-edu.com"),
      to,
      subject,
      html,
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const url = `${this.config.get<string>("CORS_ORIGIN")}/verify-email?token=${token}`;
    return this.sendEmail(
      to,
      "Verify your email",
      `<a href="${url}">Click here to verify your email</a>`,
    );
  }

  async sendPasswordReset(to: string, token: string) {
    const url = `${this.config.get<string>("CORS_ORIGIN")}/reset-password?token=${token}`;
    return this.sendEmail(
      to,
      "Reset your password",
      `<a href="${url}">Click here to reset your password</a>`,
    );
  }
}