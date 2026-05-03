import { z } from "zod";
import { defineAction } from "~/lib/actions/_core/action-utils";
import {
  cartItemPayloadSchema,
  type CartItemPayload,
} from "~/lib/actions/get-user-cart/action-definition";

/**
 * Merge a guest's local cart into the authenticated user's persisted cart.
 *
 * Strategy: union by `id`. For overlapping items, sum quantities. The merged
 * cart replaces the user's stored cart and is returned for the client to use
 * as the new source of truth.
 */
export const mergeGuestCartDefinition = defineAction<{
  items: CartItemPayload[];
}>()({
  actionDirectoryName: "merge-guest-cart",
  inputDataSchema: z.object({
    guestItems: z.array(cartItemPayloadSchema),
  }),
  invalidatesActions: ["get-user-cart"],
});
