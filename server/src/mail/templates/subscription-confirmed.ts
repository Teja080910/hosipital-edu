import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailDivider, emailSmall, emailUserInfo } from "./components";
import { t } from "./mail-messages";

export interface SubscriptionPlanDetails {
  name: string;
  amount: string;
  interval: string;
}

export function subscriptionConfirmedTemplate(
  name: string,
  plan: SubscriptionPlanDetails,
  appUrl?: string,
  locale: string = "en",
): string {
  return emailLayout({
    content: `
      ${emailH1(t(locale, "subscriptionConfirmed.heading"))}
      ${emailText(t(locale, "subscriptionConfirmed.body1", { name }))}
      ${emailDivider()}
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
        ${emailUserInfo(t(locale, "subscriptionConfirmed.planLabel"), plan.name)}
        ${emailUserInfo(t(locale, "subscriptionConfirmed.amountLabel"), plan.amount)}
        ${emailUserInfo(t(locale, "subscriptionConfirmed.billingLabel"), plan.interval)}
      </table>
      ${emailDivider()}
      ${emailText(t(locale, "subscriptionConfirmed.body2"))}
      ${emailButton(t(locale, "subscriptionConfirmed.button"), `${appUrl || "https://md-exams.com"}/dashboard`)}
      ${emailSmall(t(locale, "subscriptionConfirmed.footer"))}
    `,
    appUrl,
  });
}
