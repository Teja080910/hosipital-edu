import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall } from "./components";
import { t } from "./mail-messages";

export function subscriptionCancelledTemplate(name: string, appUrl?: string, locale: string = "en"): string {
  return emailLayout({
    content: `
      ${emailH1(t(locale, "subscriptionCancelled.heading"))}
      ${emailText(t(locale, "subscriptionCancelled.body1", { name }))}
      ${emailText(t(locale, "subscriptionCancelled.body2"))}
      ${emailButton(t(locale, "subscriptionCancelled.button"), `${appUrl || "https://md-exams.com"}/dashboard/subscribe`)}
      ${emailSmall(t(locale, "subscriptionCancelled.footer"))}
    `,
    appUrl,
  });
}
