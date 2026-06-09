import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall } from "./components";

export function subscriptionCancelledTemplate(name: string, appUrl?: string): string {
  return emailLayout({
    content: `
      ${emailH1("Subscription cancelled")}
      ${emailText(`Hi ${name}, your MD Exams subscription has been cancelled. You will continue to have access until the end of your current billing period.`)}
      ${emailText("We&rsquo;d love to have you back whenever you&rsquo;re ready. Your progress and data will be preserved.")}
      ${emailButton("Resubscribe", `${appUrl || "https://md-exams.com"}/dashboard/subscribe`)}
      ${emailSmall("If you cancelled by mistake, you can resubscribe at any time.")}
    `,
    appUrl,
  });
}