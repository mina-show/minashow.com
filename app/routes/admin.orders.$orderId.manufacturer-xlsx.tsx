import type { LoaderFunctionArgs } from "react-router";
import { eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth/admin.server";
import { db } from "~/lib/db/client";
import { orders } from "~/lib/db/schema";
import { buildManufacturerWorkbook } from "~/lib/excel/manufacturer-export.server";

const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * Resource route — streams an .xlsx of the order's items (image, name, type,
 * quantity) for the admin to forward to the manufacturer. Admin-only.
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);

  const orderId = params.orderId;
  if (!orderId) throw new Response("Missing order id", { status: 400 });

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true },
  });
  if (!order) throw new Response("Order not found", { status: 404 });

  const buffer = await buildManufacturerWorkbook(order);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": XLSX_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="order-${order.id.slice(0, 8)}-manufacturer.xlsx"`,
    },
  });
}
