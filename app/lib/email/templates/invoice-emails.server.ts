/**
 * Email templates for the admin-driven invoicing flow:
 *  - {@link renderPaymentRequestEmail} — priced order + Zeffy payment link (PDF attached)
 *  - {@link renderPaidReceiptEmail}     — confirmation that payment was received (PDF attached)
 *
 * Inline styles only — matches the shell in ./order-emails.server.ts.
 */

const BRAND_BLUE = "#202973";
const TEXT_GRAY = "#374151";
const MUTED_GRAY = "#6b7280";
const BORDER = "#e5e7eb";

export interface InvoiceEmailLineItem {
  name: string;
  quantity: number;
  /** cents */
  unitPriceCents: number;
  /** cents */
  lineTotalCents: number;
}

export interface InvoiceEmailContext {
  customerName: string;
  customerOrganization: string;
  shortOrderId: string;
  invoiceNumber: string;
  items: InvoiceEmailLineItem[];
  subtotalCents: number;
  taxLabel: string | null;
  taxRateBps: number;
  taxCents: number;
  totalCents: number;
  /** payment-request only */
  zeffyLink?: string | null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function itemRows(items: InvoiceEmailLineItem[]): string {
  return items
    .map(
      (i) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${TEXT_GRAY};font-weight:600;">${escapeHtml(i.name)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${TEXT_GRAY};text-align:center;">${i.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${TEXT_GRAY};text-align:right;">${money(i.unitPriceCents)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};font-size:14px;color:${TEXT_GRAY};text-align:right;font-weight:600;">${money(i.lineTotalCents)}</td>
        </tr>`
    )
    .join("");
}

function totalsRows(ctx: InvoiceEmailContext): string {
  const taxPct = (ctx.taxRateBps / 100).toFixed(2).replace(/\.00$/, "");
  return `
    <tr>
      <td colspan="3" style="padding:8px 12px;font-size:13px;color:${MUTED_GRAY};text-align:right;">Subtotal</td>
      <td style="padding:8px 12px;font-size:13px;color:${TEXT_GRAY};text-align:right;">${money(ctx.subtotalCents)}</td>
    </tr>
    <tr>
      <td colspan="3" style="padding:8px 12px;font-size:13px;color:${MUTED_GRAY};text-align:right;">${escapeHtml(ctx.taxLabel ?? "Tax")} (${taxPct}%)</td>
      <td style="padding:8px 12px;font-size:13px;color:${TEXT_GRAY};text-align:right;">${money(ctx.taxCents)}</td>
    </tr>
    <tr>
      <td colspan="3" style="padding:12px;font-size:15px;color:${TEXT_GRAY};font-weight:700;text-align:right;">Total</td>
      <td style="padding:12px;font-size:16px;color:${BRAND_BLUE};font-weight:700;text-align:right;">${money(ctx.totalCents)}</td>
    </tr>`;
}

function shell(args: { headline: string; intro: string; ctx: InvoiceEmailContext; footer?: string }): string {
  const { headline, intro, ctx, footer } = args;
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BORDER};">
        <tr><td style="background:${BRAND_BLUE};padding:24px 28px;">
          <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.01em;">Minashow</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 8px;color:${TEXT_GRAY};font-size:22px;font-weight:700;">${escapeHtml(headline)}</h1>
          <p style="margin:0 0 22px;color:${MUTED_GRAY};font-size:14px;line-height:1.5;">${intro}</p>
          <div style="font-size:13px;color:${MUTED_GRAY};padding-bottom:8px;font-weight:600;">INVOICE ${escapeHtml(ctx.invoiceNumber)} · ORDER ${escapeHtml(ctx.shortOrderId)}</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:8px;border-collapse:separate;overflow:hidden;">
            <thead><tr style="background:#f3f4f6;">
              <th align="left" style="padding:10px 12px;font-size:12px;color:${MUTED_GRAY};font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Item</th>
              <th align="center" style="padding:10px 12px;font-size:12px;color:${MUTED_GRAY};font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Qty</th>
              <th align="right" style="padding:10px 12px;font-size:12px;color:${MUTED_GRAY};font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Unit</th>
              <th align="right" style="padding:10px 12px;font-size:12px;color:${MUTED_GRAY};font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Total</th>
            </tr></thead>
            <tbody>${itemRows(ctx.items)}${totalsRows(ctx)}</tbody>
          </table>
          ${footer ? `<div style="margin:22px 0 0;color:${MUTED_GRAY};font-size:13px;line-height:1.6;">${footer}</div>` : ""}
        </td></tr>
        <tr><td style="padding:16px 28px;background:#f9fafb;border-top:1px solid ${BORDER};">
          <p style="margin:0;color:${MUTED_GRAY};font-size:12px;line-height:1.5;">This message was sent automatically from minashow.com. A PDF copy is attached.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Priced order + Zeffy payment instructions. PDF (payment-request) attached by caller. */
export function renderPaymentRequestEmail(
  ctx: InvoiceEmailContext
): { subject: string; html: string; text: string } {
  const subject = `Your Minashow order ${ctx.shortOrderId} — payment details`;
  const linkHtml = ctx.zeffyLink
    ? `<a href="${escapeHtml(ctx.zeffyLink)}" style="color:${BRAND_BLUE};font-weight:600;">${escapeHtml(ctx.zeffyLink)}</a>`
    : "the secure payment form provided by our team";
  const footer = `
    <strong style="color:${TEXT_GRAY};">How to pay</strong><br/>
    1. Open ${linkHtml}.<br/>
    2. Enter your order number <strong>${escapeHtml(ctx.shortOrderId)}</strong> in the note field.<br/>
    3. Enter the total amount <strong>${money(ctx.totalCents)}</strong> and complete payment.<br/><br/>
    Once your payment is received, we'll email you an official paid receipt for your records.`;
  const html = shell({
    headline: "Your order is priced and ready for payment",
    intro: `Hi ${escapeHtml(ctx.customerName.split(" ")[0])}, here are the final details for your order. Please follow the steps below to pay.`,
    ctx,
    footer,
  });
  const text = `Your Minashow order ${ctx.shortOrderId} — payment details
Invoice ${ctx.invoiceNumber}

${ctx.items.map((i) => `  • ${i.name} × ${i.quantity} — ${money(i.lineTotalCents)}`).join("\n")}
Subtotal: ${money(ctx.subtotalCents)}
${ctx.taxLabel ?? "Tax"}: ${money(ctx.taxCents)}
Total: ${money(ctx.totalCents)}

How to pay:
1. Open ${ctx.zeffyLink ?? "the secure payment form provided by our team"}
2. Enter your order number "${ctx.shortOrderId}" in the note field.
3. Enter the total amount ${money(ctx.totalCents)} and complete payment.

A PDF copy is attached.`;
  return { subject, html, text };
}

/** Payment-received confirmation. PDF (receipt) attached by caller. */
export function renderPaidReceiptEmail(
  ctx: InvoiceEmailContext
): { subject: string; html: string; text: string } {
  const subject = `Receipt for your Minashow order ${ctx.shortOrderId} — invoice ${ctx.invoiceNumber}`;
  const footer = `Payment received in full — thank you! This email and the attached PDF serve as your official receipt (invoice ${escapeHtml(ctx.invoiceNumber)}) for your records.`;
  const html = shell({
    headline: "Payment received — here's your receipt",
    intro: `Hi ${escapeHtml(ctx.customerName.split(" ")[0])}, we've received your payment. Your official receipt is below and attached as a PDF.`,
    ctx,
    footer,
  });
  const text = `Receipt — Minashow order ${ctx.shortOrderId}
Invoice ${ctx.invoiceNumber} — PAID

${ctx.items.map((i) => `  • ${i.name} × ${i.quantity} — ${money(i.lineTotalCents)}`).join("\n")}
Subtotal: ${money(ctx.subtotalCents)}
${ctx.taxLabel ?? "Tax"}: ${money(ctx.taxCents)}
Total: ${money(ctx.totalCents)}

Payment received in full — thank you! The attached PDF is your official receipt for your records.`;
  return { subject, html, text };
}
