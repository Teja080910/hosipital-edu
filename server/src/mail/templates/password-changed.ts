import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall } from "./components";
import { t } from "./mail-messages";

export function passwordChangedTemplate(name: string, appUrl?: string, locale: string = "en"): string {
  return emailLayout({
    content: `
      ${emailH1(t(locale, "passwordChanged.heading"))}
      ${emailText(t(locale, "passwordChanged.body1", { name }))}
      ${emailText(t(locale, "passwordChanged.body2"))}
      ${emailButton(t(locale, "passwordChanged.button"), `${appUrl || "https://md-exams.com"}/dashboard`)}
      ${emailSmall(t(locale, "passwordChanged.footer"))}
    `,
    appUrl,
  });
}
