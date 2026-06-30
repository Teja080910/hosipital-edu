import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall, emailSpacer } from "./components";
import { t } from "./mail-messages";

export function passwordResetTemplate(name: string, url: string, appUrl?: string, locale: string = "en"): string {
  return emailLayout({
    content: `
      <div style="text-align:center;">
        <div style="width:56px;height:56px;background:#fff7ed;border-radius:14px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        ${emailH1(t(locale, "passwordReset.heading"))}
      </div>
      ${emailText(t(locale, "passwordReset.body", { name }))}
      ${emailButton(t(locale, "passwordReset.button"), url)}
      ${emailSmall(t(locale, "passwordReset.footer"))}
    `,
    appUrl,
  });
}
