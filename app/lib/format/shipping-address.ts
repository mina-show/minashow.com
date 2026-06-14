/** Structured shipping address fields shared across the order flow. */
export interface ShippingAddressFields {
  addressLine1: string;
  /** Apt/suite/unit — optional */
  addressLine2?: string | null;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

/**
 * Single source of truth for rendering a structured address as ordered,
 * non-empty display lines. Reused by order emails and the admin order panel.
 */
export function shippingAddressLines(a: ShippingAddressFields): string[] {
  return [
    a.addressLine1,
    a.addressLine2 || null,
    [a.city, a.province, a.postalCode].filter(Boolean).join(", "),
    a.country,
  ].filter((l): l is string => Boolean(l && l.trim()));
}
