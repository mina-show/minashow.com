import { createActionHandler, parseActionInput } from "~/lib/actions/_core/action-utils";
import { submitOrderDefinition } from "./action-definition";
import { getSessionUser } from "~/lib/auth/session.server";
import { db } from "~/lib/db/client";
import { orders, orderItems } from "~/lib/db/schema";
import { ReadableError } from "~/lib/readable-error";

export default createActionHandler(
  submitOrderDefinition,
  async ({ inputData: unsafeInputData }, request) => {
    const input = parseActionInput(submitOrderDefinition, unsafeInputData);

    // Require authenticated user
    const user = await getSessionUser(request);
    if (!user) {
      throw new ReadableError("You must be signed in to place an order.");
    }

    // Compute totals (cents)
    const subtotalCents = input.items.reduce(
      (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
      0
    );

    // Insert order
    const [order] = await db
      .insert(orders)
      .values({
        userId: user.id,
        customerName: input.customerName,
        customerOrganization: input.customerOrganization,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        shippingAddress: input.shippingAddress ?? null,
        subtotalCents,
        totalCents: subtotalCents,
        notes: input.notes ?? null,
      })
      .returning({ id: orders.id });

    // Insert order items
    await db.insert(orderItems).values(
      input.items.map((item) => {
        const unitPriceCents = Math.round(item.price * 100);
        return {
          orderId: order.id,
          itemType: item.category === "packages" ? "package" : "product",
          itemName: item.name,
          itemImageUrl: item.image,
          quantity: item.quantity,
          unitPriceCents,
          lineTotalCents: unitPriceCents * item.quantity,
        };
      })
    );

    return {
      orderId: order.id,
      success: true,
    };
  }
);
