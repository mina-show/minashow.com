import PDFDocument from "pdfkit";
import { shippingAddressLines, type ShippingAddressFields } from "~/lib/format/shipping-address";

const BRAND_BLUE = "#202973";
const TEXT_GRAY = "#374151";
const MUTED_GRAY = "#6b7280";

export interface InvoicePdfLineItem {
  description: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface InvoicePdfOrder extends ShippingAddressFields {
  id: string;
  customerName: string;
  customerOrganization: string;
  customerEmail: string;
  customerPhone: string;
}

export interface InvoicePdfInvoice {
  invoiceNumber: string;
  subtotalCents: number;
  taxLabel: string | null;
  taxRateBps: number;
  taxCents: number;
  totalCents: number;
  /** How the customer paid — shown on the receipt */
  paymentMethod?: "etransfer" | "zeffy" | null;
  paidAt?: Date | null;
}

export interface BuildInvoicePdfArgs {
  order: InvoicePdfOrder;
  invoice: InvoicePdfInvoice;
  lineItems: InvoicePdfLineItem[];
  /** payment-request = shows payment instructions; receipt = marked PAID */
  mode: "payment-request" | "receipt";
  /** Zeffy payment URL — only used in payment-request mode */
  zeffyLink?: string | null;
  /** Interac e-Transfer instructions — only used in payment-request mode */
  etransferInstructions?: string | null;
}

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Human-readable label for a recorded payment method. */
function paymentMethodLabel(method: "etransfer" | "zeffy"): string {
  return method === "etransfer" ? "Interac e-Transfer" : "Zeffy";
}

/** Build the invoice/receipt PDF and resolve with its bytes. */
export function buildInvoicePdf(args: BuildInvoicePdfArgs): Promise<Buffer> {
  const { order, invoice, lineItems, mode, zeffyLink, etransferInstructions } = args;
  const shortId = order.id.slice(0, 8);
  const isReceipt = mode === "receipt";

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const contentWidth = right - left;

  // ── Header ──────────────────────────────────────────────────────────────
  doc.fillColor(BRAND_BLUE).fontSize(24).font("Helvetica-Bold").text("Minashow", left, 50);
  doc
    .fillColor(MUTED_GRAY)
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(isReceipt ? "RECEIPT" : "INVOICE", left, 52, { width: contentWidth, align: "right" });

  doc.moveDown(2);
  const metaTop = doc.y;
  doc.fillColor(TEXT_GRAY).fontSize(10).font("Helvetica");
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, left, metaTop, { width: contentWidth, align: "right" });
  doc.text(`Order #: ${shortId}`, { width: contentWidth, align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-CA")}`, { width: contentWidth, align: "right" });
  if (isReceipt) {
    doc
      .fillColor("#15803d")
      .font("Helvetica-Bold")
      .text(`PAID${invoice.paidAt ? ` — ${new Date(invoice.paidAt).toLocaleDateString("en-CA")}` : ""}`, {
        width: contentWidth,
        align: "right",
      });
    if (invoice.paymentMethod) {
      doc
        .fillColor(MUTED_GRAY)
        .font("Helvetica")
        .text(`Paid via ${paymentMethodLabel(invoice.paymentMethod)}`, { width: contentWidth, align: "right" });
    }
  } else {
    doc
      .fillColor("#b91c1c")
      .font("Helvetica-Bold")
      .text("UNPAID — PENDING PAYMENT", { width: contentWidth, align: "right" });
  }

  // ── Bill-to ─────────────────────────────────────────────────────────────
  doc.fillColor(MUTED_GRAY).fontSize(9).font("Helvetica-Bold").text("BILL TO", left, metaTop);
  doc.fillColor(TEXT_GRAY).fontSize(10).font("Helvetica");
  doc.text(order.customerName, left, doc.y + 2);
  doc.text(order.customerOrganization);
  doc.text(order.customerEmail);
  doc.text(order.customerPhone);
  shippingAddressLines(order).forEach((line) => doc.text(line));

  doc.moveDown(2);

  // ── Line-item table ────────────────────────────────────────────────────
  const colQtyX = left + 300;
  const colUnitX = left + 360;
  const colTotalX = left + 450;
  let y = doc.y;

  doc.fillColor(MUTED_GRAY).fontSize(9).font("Helvetica-Bold");
  doc.text("ITEM", left, y);
  doc.text("QTY", colQtyX, y, { width: 50, align: "right" });
  doc.text("UNIT", colUnitX, y, { width: 80, align: "right" });
  doc.text("TOTAL", colTotalX, y, { width: right - colTotalX, align: "right" });
  y += 16;
  doc.moveTo(left, y).lineTo(right, y).strokeColor("#e5e7eb").stroke();
  y += 8;

  doc.fillColor(TEXT_GRAY).fontSize(10).font("Helvetica");
  for (const item of lineItems) {
    const descHeight = doc.heightOfString(item.description, { width: 290 });
    doc.text(item.description, left, y, { width: 290 });
    doc.text(String(item.quantity), colQtyX, y, { width: 50, align: "right" });
    doc.text(money(item.unitPriceCents), colUnitX, y, { width: 80, align: "right" });
    doc.text(money(item.lineTotalCents), colTotalX, y, { width: right - colTotalX, align: "right" });
    y += Math.max(descHeight, 14) + 8;
  }

  doc.moveTo(left, y).lineTo(right, y).strokeColor("#e5e7eb").stroke();
  y += 10;

  // ── Totals ──────────────────────────────────────────────────────────────
  const labelX = colUnitX - 40;
  const labelW = colTotalX - labelX - 10;
  const valW = right - colTotalX;
  const taxPct = (invoice.taxRateBps / 100).toFixed(2).replace(/\.00$/, "");

  doc.fontSize(10).font("Helvetica").fillColor(TEXT_GRAY);
  doc.text("Subtotal", labelX, y, { width: labelW, align: "right" });
  doc.text(money(invoice.subtotalCents), colTotalX, y, { width: valW, align: "right" });
  y += 16;
  doc.text(`${invoice.taxLabel ?? "Tax"} (${taxPct}%)`, labelX, y, { width: labelW, align: "right" });
  doc.text(money(invoice.taxCents), colTotalX, y, { width: valW, align: "right" });
  y += 18;
  doc.fontSize(12).font("Helvetica-Bold").fillColor(BRAND_BLUE);
  doc.text("Total", labelX, y, { width: labelW, align: "right" });
  doc.text(money(invoice.totalCents), colTotalX, y, { width: valW, align: "right" });
  y += 30;

  // ── Payment instructions (payment-request only) ──────────────────────────
  if (!isReceipt) {
    doc.fontSize(11).font("Helvetica-Bold").fillColor(TEXT_GRAY).text("How to pay", left, y);
    doc.moveDown(0.4);

    // Option 1 — Zeffy
    doc.fontSize(10).font("Helvetica-Bold").fillColor(TEXT_GRAY).text("Option 1 — Pay online (Zeffy)");
    doc.fontSize(10).font("Helvetica").fillColor(MUTED_GRAY);
    if (zeffyLink) {
      doc.text("Open the secure payment form:", { continued: false });
      doc.fillColor(BRAND_BLUE).text(zeffyLink, { link: zeffyLink, underline: true });
      doc.fillColor(MUTED_GRAY);
    } else {
      doc.text("Open the secure payment form provided by our team.");
    }
    doc.text(`Enter your order number "${shortId}" in the note field, then pay ${money(invoice.totalCents)}.`);

    // Option 2 — Interac e-Transfer
    if (etransferInstructions) {
      doc.moveDown(0.6);
      doc.fontSize(10).font("Helvetica-Bold").fillColor(TEXT_GRAY).text("Option 2 — Interac e-Transfer");
      doc.fontSize(10).font("Helvetica").fillColor(MUTED_GRAY).text(etransferInstructions);
      doc.text(`Include your order number "${shortId}" and send the total ${money(invoice.totalCents)}.`);
    }

    doc.moveDown(0.6);
    doc.fontSize(9).fillColor(MUTED_GRAY).text(
      "Once your payment is received we'll email you an official paid receipt for your records."
    );
  }

  doc.end();
  return done;
}
