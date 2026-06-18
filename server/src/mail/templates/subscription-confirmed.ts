import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailDivider, emailSmall, emailUserInfo } from "./components";

export interface SubscriptionPlanDetails {
  name: string;
  amount: string;
  interval: string;
}

export function subscriptionConfirmedTemplate(
  name: string,
  plan: SubscriptionPlanDetails,
  appUrl?: string,
): string {
  return emailLayout({
    content: `
      ${emailH1("Subscription confirmed!")}
      ${emailText(`Hi ${name}, thank you for subscribing to MD Exam. Your payment was successful and your account is now active.`)}
      ${emailDivider()}
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
        ${emailUserInfo("Plan", plan.name)}
        ${emailUserInfo("Amount", plan.amount)}
        ${emailUserInfo("Billing", plan.interval)}
      </table>
      ${emailDivider()}
      ${emailText("You now have unlimited access to all courses, practice questions, flashcards, exam simulators, and detailed performance analytics.")}
      ${emailButton("Start Learning", `${appUrl || "https://md-exams.com"}/dashboard`)}
      ${emailSmall("Need help? Reply to this email or contact support@md-exams.com.")}
    `,
    appUrl,
  });
}