/**
 * Contact-form notification email — sent to info@ when a visitor submits the
 * contact form. Branded to match the order/password-reset templates.
 * Inline styles only for client compatibility.
 */

const BRAND_BLUE = "#202973";
const TEXT_GRAY = "#374151";
const MUTED_GRAY = "#6b7280";
const BORDER = "#e5e7eb";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface ContactSubmission {
  name: string;
  email: string;
  /** Optional — falls back to a default subject line. */
  subject?: string;
  message: string;
}

export function renderContactEmail(args: ContactSubmission): {
  subject: string;
  html: string;
  text: string;
} {
  const { name, email, subject, message } = args;
  const topic = subject?.trim() || "No subject";
  const emailSubject = `New contact form message — ${topic}`;

  const row = (label: string, value: string) => `
              <tr>
                <td style="padding:6px 0;color:${MUTED_GRAY};font-size:13px;width:90px;vertical-align:top;">${label}</td>
                <td style="padding:6px 0;color:${TEXT_GRAY};font-size:14px;">${value}</td>
              </tr>`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="background:${BRAND_BLUE};padding:24px 28px;">
              <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.01em;">Minashow</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 16px;color:${TEXT_GRAY};font-size:22px;font-weight:700;">New contact message</h1>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
                ${row("From", escapeHtml(name))}
                ${row("Email", `<a href="mailto:${escapeHtml(email)}" style="color:${BRAND_BLUE};">${escapeHtml(email)}</a>`)}
                ${row("Subject", escapeHtml(topic))}
              </table>
              <div style="border-top:1px solid ${BORDER};padding-top:16px;">
                <p style="margin:0;color:${TEXT_GRAY};font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background:#f9fafb;border-top:1px solid ${BORDER};">
              <p style="margin:0;color:${MUTED_GRAY};font-size:12px;line-height:1.5;">Reply directly to this email to respond to ${escapeHtml(name)}.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `New contact message

From: ${name}
Email: ${email}
Subject: ${topic}

${message}

Reply directly to this email to respond.`;

  return { subject: emailSubject, html, text };
}
