import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall, emailSpacer } from "./components";
import { t } from "./mail-messages";

export function verifyEmailTemplate(name: string, url: string, appUrl?: string, locale: string = "en"): string {
  return emailLayout({
    content: `
      <div style="text-align:center;">
        <div style="width:56px;height:56px;background:#eef2ff;border-radius:14px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </div>
        ${emailH1(t(locale, "verifyEmail.heading"))}
      </div>
      ${emailText(t(locale, "verifyEmail.body", { name }))}
      ${emailButton(t(locale, "verifyEmail.button"), url)}
      ${emailSmall(t(locale, "verifyEmail.footer"))}
    `,
    appUrl,
  });
}
