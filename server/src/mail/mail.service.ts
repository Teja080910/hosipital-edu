import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import {
  verifyEmailTemplate,
  welcomeTemplate,
  passwordResetTemplate,
  passwordChangedTemplate,
  subscriptionConfirmedTemplate,
  subscriptionCancelledTemplate,
  paymentFailedTemplate,
  SubscriptionPlanDetails,
} from "./templates";

@Injectable()
export class MailService {
  private resend: Resend | null = null;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>("RESEND_API_KEY");
    if (apiKey && apiKey !== "re_placeholder") {
      this.resend = new Resend(apiKey);
    }
  }

  private get appUrl(): string {
    return this.config.get<string>("APP_URL", "https://md-exams.com");
  }

  private get from(): string {
    return this.config.get<string>("MAIL_FROM", "MD Exams <noreply@mail.agrinp.cloud>");
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      return { message: "Mail not configured - skipping send", to, subject };
    }
    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });
      console.log(`[Mail] Email sent to ${to}:`, JSON.stringify(result));
      return result;
    } catch (err) {
      console.error(`[Mail] Failed to send to ${to}:`, err);
      throw err;
    }
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    const url = `${this.appUrl}/verify-email?token=${token}`;
    return this.sendEmail(
      to,
      "Verify your email address",
      verifyEmailTemplate(name, url, this.appUrl),
    );
  }

  async sendWelcome(to: string, name: string) {
    const url = `${this.appUrl}/dashboard`;
    return this.sendEmail(
      to,
      "Welcome to MD Exams!",
      welcomeTemplate(name, url, this.appUrl),
    );
  }

  async sendPasswordReset(to: string, name: string, token: string) {
    const url = `${this.appUrl}/reset-password?token=${token}`;
    return this.sendEmail(
      to,
      "Reset your password",
      passwordResetTemplate(name, url, this.appUrl),
    );
  }

  async sendPasswordChanged(to: string, name: string) {
    return this.sendEmail(
      to,
      "Your password has been changed",
      passwordChangedTemplate(name, this.appUrl),
    );
  }

  async sendSubscriptionConfirmed(to: string, name: string, plan: SubscriptionPlanDetails) {
    return this.sendEmail(
      to,
      "Subscription confirmed",
      subscriptionConfirmedTemplate(name, plan, this.appUrl),
    );
  }

  async sendSubscriptionCancelled(to: string, name: string) {
    return this.sendEmail(
      to,
      "Subscription cancelled",
      subscriptionCancelledTemplate(name, this.appUrl),
    );
  }

  async sendPaymentFailed(to: string, name: string) {
    return this.sendEmail(
      to,
      "Payment failed",
      paymentFailedTemplate(name, this.appUrl),
    );
  }
}