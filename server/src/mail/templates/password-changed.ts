import { emailLayout } from "./layout";
import { emailH1, emailText, emailButton, emailSmall, emailSpacer } from "./components";
import { t } from "./mail-messages";

export function passwordChangedTemplate(name: string, appUrl?: string, locale: string = "en"): string {
  return emailLayout({
    content: `
      <div style="text-align:center;">
        <div style="width:56px;height:56px;background:#fef2f2;border-radius:14px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        ${emailH1(t(locale, "passwordChanged.heading"))}
      </div>
      ${emailText(t(locale, "passwordChanged.body1", { name }))}
      ${emailText(t(locale, "passwordChanged.body2"))}
      ${emailButton(t(locale, "passwordChanged.button"), `${appUrl || "https://md-exams.com"}/${locale}/dashboard`)}
      ${emailSmall(t(locale, "passwordChanged.footer"))}
    `,
    appUrl,
  });
}
