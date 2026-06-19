import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall } from "./components";
import { t } from "./mail-messages";

export function verifyEmailTemplate(name: string, url: string, appUrl?: string, locale: string = "en"): string {
  return emailLayout({
    content: `
      ${emailH1(t(locale, "verifyEmail.heading"))}
      ${emailText(t(locale, "verifyEmail.body", { name }))}
      ${emailButton(t(locale, "verifyEmail.button"), url)}
      ${emailSmall(t(locale, "verifyEmail.footer"))}
    `,
    appUrl,
  });
}
