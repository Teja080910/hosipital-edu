import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall, emailSpacer } from "./components";
import { t } from "./mail-messages";

export function welcomeTemplate(name: string, url: string, appUrl?: string, locale: string = "en"): string {
  return emailLayout({
    content: `
      <div style="text-align:center;">
        <div style="width:56px;height:56px;background:#ecfdf5;border-radius:14px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        ${emailH1(t(locale, "welcome.heading"))}
      </div>
      ${emailText(t(locale, "welcome.body1", { name }))}
      ${emailText(t(locale, "welcome.body2"))}
      ${emailButton(t(locale, "welcome.button"), url)}
      ${emailSmall(t(locale, "welcome.footer"))}
    `,
    appUrl,
  });
}
