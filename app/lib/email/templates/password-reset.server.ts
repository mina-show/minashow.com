/**
 * Password-reset email — minimal branded template matching the order emails.
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

export function renderPasswordResetEmail(args: {
  userName: string;
  resetUrl: string;
  /** TTL surfaced in the email so the recipient knows the deadline. */
  expiresInMinutes: number;
}): { subject: string; html: string; text: string } {
  const { userName, resetUrl, expiresInMinutes } = args;
  const firstName = userName.split(" ")[0];

  const subject = "Reset your Minashow password";

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
              <h1 style="margin:0 0 12px;color:${TEXT_GRAY};font-size:22px;font-weight:700;">Reset your password</h1>
              <p style="margin:0 0 20px;color:${MUTED_GRAY};font-size:14px;line-height:1.6;">
                Hi ${escapeHtml(firstName)}, we received a request to reset the password for your Minashow account.
                Click the button below to choose a new one.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:${BRAND_BLUE};border-radius:9999px;">
                    <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Reset password</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;color:${MUTED_GRAY};font-size:13px;line-height:1.6;">This link expires in ${expiresInMinutes} minutes and can only be used once.</p>
              <p style="margin:0 0 16px;color:${MUTED_GRAY};font-size:13px;line-height:1.6;">If you didn't request a reset, you can safely ignore this email — your password won't change.</p>
              <p style="margin:0;color:${MUTED_GRAY};font-size:12px;line-height:1.6;word-break:break-all;">
                Trouble with the button? Paste this URL into your browser:<br/>
                <span style="color:${TEXT_GRAY};">${escapeHtml(resetUrl)}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background:#f9fafb;border-top:1px solid ${BORDER};">
              <p style="margin:0;color:${MUTED_GRAY};font-size:12px;line-height:1.5;">This message was sent automatically from minashow.com.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Reset your Minashow password

Hi ${firstName}, we received a request to reset the password for your Minashow account.

Open this link to choose a new one (expires in ${expiresInMinutes} minutes, single-use):
${resetUrl}

If you didn't request a reset, you can safely ignore this email.`;

  return { subject, html, text };
}
