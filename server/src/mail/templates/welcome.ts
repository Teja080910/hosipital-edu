import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall } from "./components";

export function welcomeTemplate(name: string, url: string, appUrl?: string): string {
  return emailLayout({
    content: `
      ${emailH1("Welcome to MD Exam!")}
      ${emailText(`Hi ${name}, your email has been verified successfully. You now have full access to everything MD Exam has to offer.`)}
      ${emailText("Start exploring medical courses, practice with exam-style questions, track your progress with detailed analytics, and prepare with confidence.")}
      ${emailButton("Go to Dashboard", url)}
      ${emailSmall("Need help? Contact our support team at support@md-exams.com.")}
    `,
    appUrl,
  });
}