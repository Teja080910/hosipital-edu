import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall } from "./components";
import { t } from "./mail-messages";

export function passwordResetTemplate(name: string, url: string, appUrl?: string, locale: string = "en"): string {
  return emailLayout({
    content: `
      ${emailH1(t(locale, "passwordReset.heading"))}
      ${emailText(t(locale, "passwordReset.body", { name }))}
      ${emailButton(t(locale, "passwordReset.button"), url)}
      ${emailSmall(t(locale, "passwordReset.footer"))}
    `,
    appUrl,
  });
}
