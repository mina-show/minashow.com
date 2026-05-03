import { eq } from "drizzle-orm";
import {
  createActionHandler,
  parseActionInput,
} from "~/lib/actions/_core/action-utils";
import { getSessionUser } from "~/lib/auth/session.server";
import { ReadableError } from "~/lib/readable-error";
import { db } from "~/lib/db/client";
import { carts, cartItems } from "~/lib/db/schema";
import { syncUserCartDefinition } from "./action-definition";

export default createActionHandler(
  syncUserCartDefinition,
  async ({ inputData: unsafeInputData }, request) => {
    const input = parseActionInput(syncUserCartDefinition, unsafeInputData);

    const user = await getSessionUser(request);
    if (!user) throw new ReadableError("You must be signed in to sync your cart.");

    // Find or create the user's cart
    let cart = await db.query.carts.findFirst({
      where: eq(carts.userId, user.id),
    });
    if (!cart) {
      const [created] = await db
        .insert(carts)
        .values({ userId: user.id })
        .returning();
      cart = created;
    }

    // Replace cart contents
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    if (input.items.length > 0) {
      await db.insert(cartItems).values(
        input.items.map((item) => ({
          cartId: cart!.id,
          itemType: item.category === "package" ? "package" : "product",
          productOrPackageId: item.id,
          itemName: item.name,
          itemImageUrl: item.image || null,
          itemCategory: item.category,
          quantity: item.quantity,
          unitPriceCents: Math.round(item.price * 100),
        }))
      );
    }

    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cart.id));

    return { success: true as const };
  }
);
