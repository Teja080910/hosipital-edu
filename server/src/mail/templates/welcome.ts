import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall } from "./components";
import { t } from "./mail-messages";

export function welcomeTemplate(name: string, url: string, appUrl?: string, locale: string = "en"): string {
  return emailLayout({
    content: `
      ${emailH1(t(locale, "welcome.heading"))}
      ${emailText(t(locale, "welcome.body1", { name }))}
      ${emailText(t(locale, "welcome.body2"))}
      ${emailButton(t(locale, "welcome.button"), url)}
      ${emailSmall(t(locale, "welcome.footer"))}
    `,
    appUrl,
  });
}
