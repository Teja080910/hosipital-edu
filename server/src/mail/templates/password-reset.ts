import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall } from "./components";

export function passwordResetTemplate(name: string, url: string, appUrl?: string): string {
  return emailLayout({
    content: `
      ${emailH1("Reset your password")}
      ${emailText(`Hi ${name}, we received a request to reset the password for your MD Exams account. Click the button below to create a new password.`)}
      ${emailButton("Reset Password", url)}
      ${emailSmall("This link expires in 1 hour. If you didn&rsquo;t request a password reset, you can safely ignore this email &mdash; your password will remain unchanged.")}
    `,
    appUrl,
  });
}