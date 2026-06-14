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
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province/State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
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
