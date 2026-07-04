import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall, emailSpacer } from "./components";
import { t } from "./mail-messages";

export function paymentFailedTemplate(name: string, appUrl?: string, locale: string = "en"): string {
  return emailLayout({
    content: `
      <div style="text-align:center;">
        <div style="width:56px;height:56px;background:#fef2f2;border-radius:14px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        ${emailH1(t(locale, "paymentFailed.heading"))}
      </div>
      ${emailText(t(locale, "paymentFailed.body1", { name }))}
      ${emailText(t(locale, "paymentFailed.body2"))}
      ${emailButton(t(locale, "paymentFailed.button"), `${appUrl || "https://md-exams.com"}/${locale}/dashboard/subscribe`)}
      ${emailSmall(t(locale, "paymentFailed.footer"))}
    `,
    appUrl,
  });
}
