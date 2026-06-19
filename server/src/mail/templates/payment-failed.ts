import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall } from "./components";
import { t } from "./mail-messages";

export function paymentFailedTemplate(name: string, appUrl?: string, locale: string = "en"): string {
  return emailLayout({
    content: `
      ${emailH1(t(locale, "paymentFailed.heading"))}
      ${emailText(t(locale, "paymentFailed.body1", { name }))}
      ${emailText(t(locale, "paymentFailed.body2"))}
      ${emailButton(t(locale, "paymentFailed.button"), `${appUrl || "https://md-exams.com"}/dashboard/subscribe`)}
      ${emailSmall(t(locale, "paymentFailed.footer"))}
    `,
    appUrl,
  });
}
