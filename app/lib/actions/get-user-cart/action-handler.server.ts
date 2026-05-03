import { eq } from "drizzle-orm";
import { createActionHandler } from "~/lib/actions/_core/action-utils";
import { getSessionUser } from "~/lib/auth/session.server";
import { db } from "~/lib/db/client";
import { carts, cartItems } from "~/lib/db/schema";
import { getUserCartDefinition, type CartItemPayload } from "./action-definition";

export default createActionHandler(getUserCartDefinition, async (_data, request) => {
  const user = await getSessionUser(request);
  if (!user) return { items: [] };

  const cart = await db.query.carts.findFirst({
    where: eq(carts.userId, user.id),
    with: { items: true },
  });

  if (!cart) return { items: [] };

  const items: CartItemPayload[] = cart.items.map((row) => ({
    id: row.productOrPackageId,
    name: row.itemName,
    price: row.unitPriceCents / 100,
    quantity: row.quantity,
    image: row.itemImageUrl ?? "",
    category: row.itemCategory ?? "",
  }));

  return { items };
});
