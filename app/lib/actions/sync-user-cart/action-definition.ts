import { z } from "zod";
import { defineAction } from "~/lib/actions/_core/action-utils";
import { cartItemPayloadSchema } from "~/lib/actions/get-user-cart/action-definition";

/**
 * Replace the user's persisted cart with the provided items.
 * One-shot write — the cart is small enough that we don't need per-item CRUD.
 */
export const syncUserCartDefinition = defineAction<{ success: true }>()({
  actionDirectoryName: "sync-user-cart",
  inputDataSchema: z.object({
    items: z.array(cartItemPayloadSchema),
  }),
  invalidatesActions: ["get-user-cart"],
});
