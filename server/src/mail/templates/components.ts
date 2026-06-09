export function emailH1(text: string): string {
  return `<h1 class="email-h1" style="font-size:24px;font-weight:700;color:#0b1120;margin:0 0 8px;letter-spacing:-0.3px;">${text}</h1>`;
}

export function emailText(text: string): string {
  return `<p class="email-body-text" style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;">${text}</p>`;
}

export function emailSmall(text: string): string {
  return `<p style="font-size:13px;color:#94a3b8;line-height:1.5;margin:8px 0 0;">${text}</p>`;
}

export function emailButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 24px;">
    <tr>
      <td align="center" style="background-color:#2563eb;border-radius:10px;box-shadow:0 4px 14px rgba(37,99,235,0.25);">
        <a href="${url}" target="_blank" class="email-btn" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;padding:14px 36px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

export function emailDivider(): string {
  return `<hr style="border:none;border-top:1px solid #e6edf5;margin:28px 0;">`;
}

export function emailSpacer(size: number = 16): string {
  return `<div style="height:${size}px;">&nbsp;</div>`;
}

export function emailBadge(text: string, color: string = "#2563eb"): string {
  return `<span style="display:inline-block;background-color:${color}15;color:${color};font-size:13px;font-weight:600;padding:4px 12px;border-radius:6px;">${text}</span>`;
}

export function emailUserInfo(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:14px;color:#64748b;width:100px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#0b1120;font-weight:500;">${value}</td>
  </tr>`;
}