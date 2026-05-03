/**
 * Minimal HTML templates for transactional order emails.
 *
 * Two flavours:
 *  - {@link renderAdminOrderEmail} — sent to the routing admins (and the info@ catch-all)
 *  - {@link renderCustomerReceiptEmail} — sent to the buyer
 *
 * Inline styles only — most email clients strip <style> blocks and external CSS.
 */

const BRAND_BLUE = "#202973";
const TEXT_GRAY = "#374151";
const MUTED_GRAY = "#6b7280";
const BORDER = "#e5e7eb";

export interface EmailOrderItem {
  name: string;
  category: string;
  quantity: number;
  /** Per-unit price in dollars */
  price: number;
}

export interface EmailOrderContext {
  orderId: string;
  customerName: string;
  customerOrganization: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string | null;
  notes?: string | null;
  items: EmailOrderItem[];
  /** Order subtotal in dollars */
  total: number;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderItemRows(items: EmailOrderItem[]): string {
  return items
    .map((item) => {
      const lineTotal = (item.price * item.quantity).toFixed(2);
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${TEXT_GRAY};">
            <div style="font-weight:600;">${escapeHtml(item.name)}</div>
            <div style="color:${MUTED_GRAY};font-size:12px;text-transform:capitalize;margin-top:2px;">${escapeHtml(item.category)}</div>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${TEXT_GRAY};text-align:center;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${TEXT_GRAY};text-align:right;font-weight:600;">$${lineTotal}</td>
        </tr>
      `;
    })
    .join("");
}

function renderShell(args: {
  headline: string;
  intro: string;
  context: EmailOrderContext;
  items: EmailOrderItem[];
  /** Optional copy block shown above the totals (e.g. payment info for the customer) */
  footer?: string;
}): string {
  const { headline, intro, context, items, footer } = args;
  const totalForItems = items
    .reduce((sum, i) => sum + i.price * i.quantity, 0)
    .toFixed(2);

  const customerBlock = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="font-size:13px;color:${MUTED_GRAY};padding-bottom:4px;font-weight:600;">CUSTOMER</td>
      </tr>
      <tr>
        <td style="font-size:14px;color:${TEXT_GRAY};line-height:1.5;">
          ${escapeHtml(context.customerName)}<br/>
          ${escapeHtml(context.customerOrganization)}<br/>
          ${escapeHtml(context.customerEmail)}<br/>
          ${escapeHtml(context.customerPhone)}
          ${context.shippingAddress ? `<br/><br/><span style="color:${MUTED_GRAY};font-size:13px;font-weight:600;">SHIPPING</span><br/>${escapeHtml(context.shippingAddress).replace(/\n/g, "<br/>")}` : ""}
          ${context.notes ? `<br/><br/><span style="color:${MUTED_GRAY};font-size:13px;font-weight:600;">NOTES</span><br/>${escapeHtml(context.notes).replace(/\n/g, "<br/>")}` : ""}
        </td>
      </tr>
    </table>
  `;

  return `<!DOCTYPE html>
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
              <h1 style="margin:0 0 8px;color:${TEXT_GRAY};font-size:22px;font-weight:700;">${escapeHtml(headline)}</h1>
              <p style="margin:0 0 22px;color:${MUTED_GRAY};font-size:14px;line-height:1.5;">${escapeHtml(intro)}</p>

              ${customerBlock}

              <div style="font-size:13px;color:${MUTED_GRAY};padding-bottom:8px;font-weight:600;">ORDER ${escapeHtml(context.orderId.slice(0, 8))}</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:8px;border-collapse:separate;overflow:hidden;">
                <thead>
                  <tr style="background:#f3f4f6;">
                    <th align="left" style="padding:10px 12px;font-size:12px;color:${MUTED_GRAY};font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Item</th>
                    <th align="center" style="padding:10px 12px;font-size:12px;color:${MUTED_GRAY};font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Qty</th>
                    <th align="right" style="padding:10px 12px;font-size:12px;color:${MUTED_GRAY};font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderItemRows(items)}
                  <tr>
                    <td colspan="2" style="padding:14px 12px;font-size:14px;color:${TEXT_GRAY};font-weight:700;text-align:right;">Subtotal</td>
                    <td style="padding:14px 12px;font-size:16px;color:${BRAND_BLUE};font-weight:700;text-align:right;">$${totalForItems}</td>
                  </tr>
                </tbody>
              </table>

              ${footer ? `<p style="margin:22px 0 0;color:${MUTED_GRAY};font-size:13px;line-height:1.6;">${footer}</p>` : ""}
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
}

/**
 * Render an admin-facing order email. `itemsForRecipient` lets us send the costume
 * admin only the costume items, the general admin only the non-costume items, and
 * info@ everything.
 */
export function renderAdminOrderEmail(args: {
  context: EmailOrderContext;
  itemsForRecipient: EmailOrderItem[];
  /** Short label shown in the headline, e.g. "Costume Items", "All Items" */
  scope: string;
}): { subject: string; html: string; text: string } {
  const { context, itemsForRecipient, scope } = args;

  const subject = `[Minashow] New order #${context.orderId.slice(0, 8)} — ${scope}`;
  const html = renderShell({
    headline: `New order received — ${scope}`,
    intro: `${context.customerName} (${context.customerOrganization}) just placed an order. Items relevant to you are listed below.`,
    context,
    items: itemsForRecipient,
  });
  const text = `New Minashow order #${context.orderId.slice(0, 8)} — ${scope}
Customer: ${context.customerName} (${context.customerOrganization})
Email: ${context.customerEmail}
Phone: ${context.customerPhone}
${itemsForRecipient.map((i) => `  • ${i.name} × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`).join("\n")}`;

  return { subject, html, text };
}

/** Customer-facing receipt — confirms the order and explains next steps. */
export function renderCustomerReceiptEmail(
  context: EmailOrderContext
): { subject: string; html: string; text: string } {
  const subject = `Thanks for your order, ${context.customerName.split(" ")[0]}!`;
  const html = renderShell({
    headline: "We received your order",
    intro: `Thanks for your order, ${context.customerName.split(" ")[0]}. Our team will review the items and reach out shortly with payment details.`,
    context,
    items: context.items,
    footer:
      "Payment is handled after order review. You'll receive a Zeffy payment link from our team and a PDF donation receipt for your taxes.",
  });
  const text = `Thanks for your order, ${context.customerName.split(" ")[0]}!
Order #${context.orderId.slice(0, 8)}

Our team will review your items and reach out shortly with payment details.

${context.items.map((i) => `  • ${i.name} × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`).join("\n")}
Subtotal: $${context.total.toFixed(2)}`;

  return { subject, html, text };
}
