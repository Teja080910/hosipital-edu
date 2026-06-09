import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall } from "./components";

export function paymentFailedTemplate(name: string, appUrl?: string): string {
  return emailLayout({
    content: `
      ${emailH1("Payment failed")}
      ${emailText(`Hi ${name}, we were unable to process your latest subscription payment. Don&rsquo;t worry &mdash; we&rsquo;ll try again in a few days.`)}
      ${emailText("To avoid any interruption to your access, please update your payment method as soon as possible.")}
      ${emailButton("Update Payment Method", `${appUrl || "https://md-exams.com"}/dashboard/subscribe`)}
      ${emailSmall("If you need assistance, contact support@md-exams.com.")}
    `,
    appUrl,
  });
}