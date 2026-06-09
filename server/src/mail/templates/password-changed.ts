import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall } from "./components";

export function passwordChangedTemplate(name: string, appUrl?: string): string {
  return emailLayout({
    content: `
      ${emailH1("Your password has been changed")}
      ${emailText(`Hi ${name}, your MD Exams account password was successfully changed.`)}
      ${emailText("If you made this change, no further action is needed. If you did not change your password, please contact our support team immediately to secure your account.")}
      ${emailButton("Go to Dashboard", `${appUrl || "https://md-exams.com"}/dashboard`)}
      ${emailSmall("Questions? Contact support@md-exams.com.")}
    `,
    appUrl,
  });
}