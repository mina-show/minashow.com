import { z } from "zod";
import { defineAction } from "~/lib/actions/_core/action-utils";

export const submitOrderDefinition = defineAction<{
  orderId: string;
  success: boolean;
}>()({
  actionDirectoryName: "submit-order",
  inputDataSchema: z.object({
    customerName: z.string().min(1, "Name is required"),
    customerOrganization: z.string().min(1, "Organization is required"),
    customerEmail: z.string().email("Invalid email"),
    customerPhone: z.string().min(1, "Phone is required"),
    shippingAddress: z.string().min(1, "Shipping address is required"),
    notes: z.string().optional(),
    items: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number().int().positive(),
        image: z.string(),
        category: z.string(),
      })
    ).min(1, "Cart cannot be empty"),
  }),
});
