import { z } from "zod";
import { defineAction } from "~/lib/actions/_core/action-utils";

/** Shape of a cart item as returned to the client (matches the in-memory CartItem). */
export const cartItemPayloadSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
  image: z.string(),
  category: z.string(),
});

export type CartItemPayload = z.infer<typeof cartItemPayloadSchema>;

export const getUserCartDefinition = defineAction<{
  items: CartItemPayload[];
}>()({
  actionDirectoryName: "get-user-cart",
  type: "query",
  inputDataSchema: z.object({}),
});
