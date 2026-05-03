import { eq } from "drizzle-orm";
import {
  createActionHandler,
  parseActionInput,
} from "~/lib/actions/_core/action-utils";
import { getSessionUser } from "~/lib/auth/session.server";
import { ReadableError } from "~/lib/readable-error";
import { db } from "~/lib/db/client";
import { carts, cartItems } from "~/lib/db/schema";
import { mergeGuestCartDefinition } from "./action-definition";
import type { CartItemPayload } from "~/lib/actions/get-user-cart/action-definition";

export default createActionHandler(
  mergeGuestCartDefinition,
  async ({ inputData: unsafeInputData }, request) => {
    const input = parseActionInput(mergeGuestCartDefinition, unsafeInputData);

    const user = await getSessionUser(request);
    if (!user) throw new ReadableError("You must be signed in to merge your cart.");

    // Find or create the user's cart
    let cart = await db.query.carts.findFirst({
      where: eq(carts.userId, user.id),
      with: { items: true },
    });
    if (!cart) {
      const [created] = await db
        .insert(carts)
        .values({ userId: user.id })
        .returning();
      cart = { ...created, items: [] };
    }

    // Build merged map keyed by source id (productOrPackageId)
    const merged = new Map<string, CartItemPayload>();

    for (const row of cart.items) {
      merged.set(row.productOrPackageId, {
        id: row.productOrPackageId,
        name: row.itemName,
        price: row.unitPriceCents / 100,
        quantity: row.quantity,
        image: row.itemImageUrl ?? "",
        category: row.itemCategory ?? "",
      });
    }

    for (const guest of input.guestItems) {
      const existing = merged.get(guest.id);
      merged.set(
        guest.id,
        existing
          ? { ...existing, quantity: existing.quantity + guest.quantity }
          : guest
      );
    }

    const mergedItems = Array.from(merged.values());

    // Replace stored cart contents with the merged set
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    if (mergedItems.length > 0) {
      await db.insert(cartItems).values(
        mergedItems.map((item) => ({
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

    return { items: mergedItems };
  }
);
