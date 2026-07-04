import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall, emailSpacer } from "./components";
import { t } from "./mail-messages";

export function subscriptionCancelledTemplate(name: string, appUrl?: string, locale: string = "en"): string {
  return emailLayout({
    content: `
      <div style="text-align:center;">
        <div style="width:56px;height:56px;background:#fef2f2;border-radius:14px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        ${emailH1(t(locale, "subscriptionCancelled.heading"))}
      </div>
      ${emailText(t(locale, "subscriptionCancelled.body1", { name }))}
      ${emailText(t(locale, "subscriptionCancelled.body2"))}
      ${emailButton(t(locale, "subscriptionCancelled.button"), `${appUrl || "https://md-exams.com"}/${locale}/dashboard/subscribe`)}
      ${emailSmall(t(locale, "subscriptionCancelled.footer"))}
    `,
    appUrl,
  });
}
