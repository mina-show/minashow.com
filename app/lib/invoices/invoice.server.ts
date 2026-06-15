import { eq } from "drizzle-orm";
import { db } from "~/lib/db/client";
import { invoices, invoiceLineItems, orders, emailNotifications } from "~/lib/db/schema";
import { serverEnv } from "~/lib/env/env.defaults.server";
import { ReadableError } from "~/lib/readable-error";
import { sendEmail } from "~/lib/email/email-client.server";
import { buildInvoicePdf } from "~/lib/pdf/invoice-pdf.server";
import {
  renderPaymentRequestEmail,
  renderPaidReceiptEmail,
  type InvoiceEmailContext,
} from "~/lib/email/templates/invoice-emails.server";

/** A line item as priced by the admin. */
export interface PricedLineItem {
  /** FK to the originating order item (nullable-safe — may be omitted) */
  orderItemId?: string | null;
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export interface SaveInvoiceInput {
  lineItems: PricedLineItem[];
  taxRateBps: number;
  taxLabel: string | null;
  /** Optional pre-tax subtotal override; when set, replaces the summed line totals. */
  overrideSubtotalCents?: number | null;
}

interface ComputedTotals {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

/** Compute subtotal / tax / total from priced line items (cents, integer math). */
export function computeTotals(
  lineItems: PricedLineItem[],
  taxRateBps: number,
  overrideSubtotalCents?: number | null
): ComputedTotals {
  const summed = lineItems.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
  const subtotalCents =
    overrideSubtotalCents != null && overrideSubtotalCents >= 0 ? overrideSubtotalCents : summed;
  const taxCents = Math.round((subtotalCents * taxRateBps) / 10000);
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

/** Generate the next human-readable invoice number, e.g. INV-2026-0007. */
async function nextInvoiceNumber(): Promise<string> {
  const count = await db.$count(invoices);
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Create or update the invoice for an order with admin-entered pricing, then
 * replace its line items. Does not change invoice status (keeps draft/sent/paid).
 */
export async function saveInvoicePricing(orderId: string, input: SaveInvoiceInput): Promise<void> {
  const totals = computeTotals(input.lineItems, input.taxRateBps, input.overrideSubtotalCents);

  const existing = await db.query.invoices.findFirst({ where: eq(invoices.orderId, orderId) });

  // Sequential writes — the neon-http driver has no interactive transactions
  // (matches the convention in submit-order's handler).
  let invoiceId: string;
  if (existing) {
    await db
      .update(invoices)
      .set({
        subtotalCents: totals.subtotalCents,
        taxLabel: input.taxLabel,
        taxRateBps: input.taxRateBps,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, existing.id));
    invoiceId = existing.id;
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoiceId));
  } else {
    const [created] = await db
      .insert(invoices)
      .values({
        orderId,
        invoiceNumber: await nextInvoiceNumber(),
        status: "draft",
        subtotalCents: totals.subtotalCents,
        taxLabel: input.taxLabel,
        taxRateBps: input.taxRateBps,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
      })
      .returning({ id: invoices.id });
    invoiceId = created.id;
  }

  if (input.lineItems.length > 0) {
    await db.insert(invoiceLineItems).values(
      input.lineItems.map((i) => ({
        invoiceId,
        orderItemId: i.orderItemId ?? null,
        description: i.description,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
        lineTotalCents: i.unitPriceCents * i.quantity,
      }))
    );
  }
}

/** Load the order + its invoice + line items, or throw if not invoiced yet. */
async function loadInvoiceContext(orderId: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { invoice: { with: { lineItems: true } } },
  });
  if (!order) throw new ReadableError("Order not found.");
  if (!order.invoice) throw new ReadableError("Save prices before sending this email.");
  return { order, invoice: order.invoice };
}

function toEmailContext(
  order: Awaited<ReturnType<typeof loadInvoiceContext>>["order"],
  invoice: Awaited<ReturnType<typeof loadInvoiceContext>>["invoice"]
): InvoiceEmailContext {
  return {
    customerName: order.customerName,
    customerOrganization: order.customerOrganization,
    shortOrderId: order.id.slice(0, 8),
    invoiceNumber: invoice.invoiceNumber,
    items: invoice.lineItems.map((li) => ({
      name: li.description,
      quantity: li.quantity,
      unitPriceCents: li.unitPriceCents,
      lineTotalCents: li.lineTotalCents,
    })),
    subtotalCents: invoice.subtotalCents,
    taxLabel: invoice.taxLabel,
    taxRateBps: invoice.taxRateBps,
    taxCents: invoice.taxCents,
    totalCents: invoice.totalCents,
  };
}

/** Build the shared PDF args from an order + invoice. */
function toPdfArgs(
  order: Awaited<ReturnType<typeof loadInvoiceContext>>["order"],
  invoice: Awaited<ReturnType<typeof loadInvoiceContext>>["invoice"],
  mode: "payment-request" | "receipt"
) {
  return {
    order: {
      id: order.id,
      customerName: order.customerName,
      customerOrganization: order.customerOrganization,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      addressLine1: order.shippingAddressLine1,
      addressLine2: order.shippingAddressLine2,
      city: order.shippingCity,
      province: order.shippingProvince,
      postalCode: order.shippingPostalCode,
      country: order.shippingCountry,
    },
    invoice: {
      invoiceNumber: invoice.invoiceNumber,
      subtotalCents: invoice.subtotalCents,
      taxLabel: invoice.taxLabel,
      taxRateBps: invoice.taxRateBps,
      taxCents: invoice.taxCents,
      totalCents: invoice.totalCents,
      paidAt: invoice.paidAt,
    },
    lineItems: invoice.lineItems.map((li) => ({
      description: li.description,
      quantity: li.quantity,
      unitPriceCents: li.unitPriceCents,
      lineTotalCents: li.lineTotalCents,
    })),
    mode,
  };
}

/** Record an email attempt for the order in email_notifications. */
async function logEmail(
  orderId: string,
  recipientEmail: string,
  triggerEvent: "payment-request" | "paid-receipt",
  subject: string,
  result: { success: boolean; error: string | null }
): Promise<void> {
  await db.insert(emailNotifications).values({
    orderId,
    recipientEmail,
    recipientRole: "customer",
    triggerEvent,
    subject,
    status: result.success ? "sent" : "failed",
    sentAt: result.success ? new Date() : null,
    errorMessage: result.error,
  });
}

/**
 * Send the customer the priced order + Zeffy payment instructions (PDF attached),
 * and flip the invoice to "sent". Throws (ReadableError) if not yet priced.
 */
export async function sendPaymentEmail(orderId: string): Promise<void> {
  const { order, invoice } = await loadInvoiceContext(orderId);
  const ctx = { ...toEmailContext(order, invoice), zeffyLink: serverEnv.ZEFFY_LINK ?? null };

  const pdf = await buildInvoicePdf({ ...toPdfArgs(order, invoice, "payment-request"), zeffyLink: serverEnv.ZEFFY_LINK ?? null });
  const email = renderPaymentRequestEmail(ctx);

  const result = await sendEmail({
    to: order.customerEmail,
    subject: email.subject,
    html: email.html,
    text: email.text,
    from: serverEnv.EMAIL_FROM_ORDERS,
    attachments: [{ filename: `invoice-${invoice.invoiceNumber}.pdf`, content: pdf }],
  });

  await db
    .update(invoices)
    .set({ status: "sent", sentAt: new Date(), sentToEmail: order.customerEmail, updatedAt: new Date() })
    .where(eq(invoices.id, invoice.id));

  await logEmail(orderId, order.customerEmail, "payment-request", email.subject, result);
}

/**
 * Send the official paid receipt (PDF attached) and mark the invoice "paid".
 * No-op when the order has no invoice or the invoice is already paid (so a
 * repeated status change won't resend). Triggered by status → "confirmed".
 */
export async function sendPaidReceipt(orderId: string): Promise<void> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { invoice: { with: { lineItems: true } } },
  });
  if (!order?.invoice) return;
  if (order.invoice.status === "paid") return;

  const invoice = { ...order.invoice, paidAt: new Date() };
  const ctx = toEmailContext(order, invoice);

  const pdf = await buildInvoicePdf(toPdfArgs(order, invoice, "receipt"));
  const email = renderPaidReceiptEmail(ctx);

  const result = await sendEmail({
    to: order.customerEmail,
    subject: email.subject,
    html: email.html,
    text: email.text,
    from: serverEnv.EMAIL_FROM_ORDERS,
    attachments: [{ filename: `receipt-${invoice.invoiceNumber}.pdf`, content: pdf }],
  });

  await db
    .update(invoices)
    .set({ status: "paid", paidAt: invoice.paidAt, updatedAt: new Date() })
    .where(eq(invoices.id, order.invoice.id));

  await logEmail(orderId, order.customerEmail, "paid-receipt", email.subject, result);
}
