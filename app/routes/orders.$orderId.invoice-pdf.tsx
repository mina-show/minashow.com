import type { LoaderFunctionArgs } from "react-router";
import { requireCustomer } from "~/lib/auth/admin.server";
import { buildCustomerInvoicePdf } from "~/lib/invoices/invoice.server";
import { ReadableError } from "~/lib/readable-error";

/**
 * Resource route — streams the customer's own invoice/receipt PDF. The PDF
 * renders as an official receipt once paid, otherwise as an unpaid invoice.
 * Ownership is enforced inside {@link buildCustomerInvoicePdf}.
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireCustomer(request);

  const orderId = params.orderId;
  if (!orderId) throw new Response("Missing order id", { status: 400 });

  try {
    const { buffer, filename } = await buildCustomerInvoicePdf(orderId, user.id);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (err instanceof ReadableError) throw new Response(err.message, { status: 404 });
    throw err;
  }
}
