interface LayoutProps {
  content: string;
  appUrl?: string;
}

const LOGO_URL = "https://lh3.googleusercontent.com/d/1Vrc1VnGSP8pufWCpeJBpEctiH_Bh3cXX";

export function emailLayout({ content, appUrl = "https://md-exams.com" }: LayoutProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>MD Exam</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-body { padding: 16px 8px !important; }
      .email-container { padding: 0 !important; }
      .email-content { padding: 28px 20px !important; }
      .email-header { padding: 0 0 24px !important; }
      .email-logo { width: 48px !important; height: 48px !important; }
      .email-h1 { font-size: 22px !important; }
      .email-btn { padding: 14px 28px !important; font-size: 14px !important; }
      .email-footer { padding: 24px 20px !important; }
      .email-body-text { font-size: 15px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6fb;">
    <tr>
      <td align="center" class="email-body" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td align="center" class="email-header" style="padding:0 0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${LOGO_URL}" alt="MD Exam" width="56" height="56" class="email-logo" style="display:block;margin:0 auto 12px;border-radius:12px;border:1px solid #e8edf5;">
                    <span style="font-size:18px;font-weight:700;color:#0b1120;letter-spacing:-0.3px;">MD Exam</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:40px 36px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.04);" class="email-content">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" class="email-footer" style="padding:32px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size:13px;color:#94a3b8;line-height:1.6;">
                    <p style="margin:0 0 4px;">&copy; 2024 MD Exam. All rights reserved.</p>
                    <p style="margin:0;">MD Exam &mdash; Master Medical Education</p>
                    <p style="margin:10px 0 0;">
                      <a href="${appUrl}" style="color:#2563eb;text-decoration:none;font-weight:500;">${appUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
