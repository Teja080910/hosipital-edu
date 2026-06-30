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
import { t } from "./templates/mail-messages";
import { I18nService } from "../common/i18n/i18n.service";

@Injectable()
export class MailService {
  private resend: Resend | null = null;

  constructor(
    private config: ConfigService,
    private i18n: I18nService,
  ) {
    const apiKey = this.config.get<string>("RESEND_API_KEY");
    if (apiKey && apiKey !== "re_placeholder") {
      this.resend = new Resend(apiKey);
    }
  }

  private get appUrl(): string {
    return this.config.get<string>("APP_URL", "https://md-exams.com");
  }

  private get from(): string {
    return this.config.get<string>("MAIL_FROM", "MD Exam <onboarding@resend.dev>");
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      return { message: this.i18n.t("common.mailNotConfigured"), to, subject };
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

  async sendVerificationEmail(to: string, name: string, token: string, locale: string = "en") {
    const url = `${this.appUrl}/verify-email?token=${token}`;
    return this.sendEmail(
      to,
      t(locale, "verifyEmail.subject"),
      verifyEmailTemplate(name, url, this.appUrl, locale),
    );
  }

  async sendWelcome(to: string, name: string, locale: string = "en") {
    const url = `${this.appUrl}/dashboard`;
    return this.sendEmail(
      to,
      t(locale, "welcome.subject"),
      welcomeTemplate(name, url, this.appUrl, locale),
    );
  }

  async sendPasswordReset(to: string, name: string, token: string, locale: string = "en") {
    const url = `${this.appUrl}/reset-password?token=${token}`;
    return this.sendEmail(
      to,
      t(locale, "passwordReset.subject"),
      passwordResetTemplate(name, url, this.appUrl, locale),
    );
  }

  async sendPasswordChanged(to: string, name: string, locale: string = "en") {
    return this.sendEmail(
      to,
      t(locale, "passwordChanged.subject"),
      passwordChangedTemplate(name, this.appUrl, locale),
    );
  }

  async sendSubscriptionConfirmed(to: string, name: string, plan: SubscriptionPlanDetails, locale: string = "en") {
    return this.sendEmail(
      to,
      t(locale, "subscriptionConfirmed.subject"),
      subscriptionConfirmedTemplate(name, plan, this.appUrl, locale),
    );
  }

  async sendSubscriptionCancelled(to: string, name: string, locale: string = "en") {
    return this.sendEmail(
      to,
      t(locale, "subscriptionCancelled.subject"),
      subscriptionCancelledTemplate(name, this.appUrl, locale),
    );
  }

  async sendPaymentFailed(to: string, name: string, locale: string = "en") {
    return this.sendEmail(
      to,
      t(locale, "paymentFailed.subject"),
      paymentFailedTemplate(name, this.appUrl, locale),
    );
  }

  private resolveLocalized(locale: string, key: string): string {
    return t(locale, key);
  }
}