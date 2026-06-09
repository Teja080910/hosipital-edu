import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall } from "./components";

export function verifyEmailTemplate(name: string, url: string, appUrl?: string): string {
  return emailLayout({
    content: `
      ${emailH1("Verify your email address")}
      ${emailText(`Hi ${name}, thanks for creating your MD Exams account. Please verify your email address to unlock full access to our medical exam preparation platform.`)}
      ${emailButton("Verify Email", url)}
      ${emailSmall("This link expires in 24 hours. If you didn&rsquo;t sign up for MD Exams, you can safely ignore this email.")}
    `,
    appUrl,
  });
}