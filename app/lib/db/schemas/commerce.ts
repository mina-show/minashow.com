import { integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { categories } from "./catalog";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const orderStatusEnum = pgEnum("order_status", [
  "pending",      // Created, awaiting payment confirmation
  "confirmed",    // Payment confirmed
  "processing",   // Being prepared/fulfilled
  "shipped",      // Dispatched to customer
  "delivered",    // Received by customer
  "cancelled",    // Cancelled before fulfilment
  "refunded",     // Payment returned
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",   // Created, prices not yet filled
  "sent",    // Sent to customer
  "paid",    // Customer has paid
]);

export const emailStatusEnum = pgEnum("email_status", [
  "queued",  // Waiting to be sent
  "sent",    // Successfully sent
  "failed",  // Failed to send
]);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

/**
 * Carts — persisted for both authenticated users and guests.
 * Guest carts are identified by a sessionId cookie.
 * On login, guest cart should be merged into the user's cart.
 */
export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Null for guest carts */
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  /** Used to identify guest carts before login */
  guestSessionId: varchar("guest_session_id", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Cart items — supports both individual products and packages.
 * Mirrors the order_items shape so checkout flow translates 1:1.
 */
export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  /** Discriminator: "product" or "package" */
  itemType: varchar("item_type", { length: 50 }).notNull(),
  /** Source id from the catalog (product id or package id) — uniquely identifies the line within a cart */
  productOrPackageId: varchar("product_or_package_id", { length: 255 }).notNull(),
  /** Snapshot of item name at time of add-to-cart */
  itemName: varchar("item_name", { length: 255 }).notNull(),
  /** Snapshot of item image */
  itemImageUrl: text("item_image_url"),
  /** Free-form category label from the catalog (e.g. "package", "costumes") */
  itemCategory: varchar("item_category", { length: 255 }),
  /** Optional FK to a catalog category — kept for back-references but not required */
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  quantity: integer("quantity").notNull().default(1),
  /** Snapshot of unit price (cents) at time of add-to-cart */
  unitPriceCents: integer("unit_price_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Orders — one per checkout */
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Null if guest checked out without creating an account */
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  /** Customer contact info captured at checkout */
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerOrganization: varchar("customer_organization", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  /** Shipping address for production/fulfillment */
  shippingAddress: text("shipping_address"),
  status: orderStatusEnum("status").notNull().default("pending"),
  /** Subtotal before any discounts/fees (cents) */
  subtotalCents: integer("subtotal_cents").notNull(),
  /** Final charged amount (cents) */
  totalCents: integer("total_cents").notNull(),
  /** Optional customer notes */
  notes: text("notes"),
  /** Which admin email(s) were notified about this order */
  assignedAdmin: varchar("assigned_admin", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Order items — snapshot of what was purchased.
 * Supports both individual products and packages.
 * Price is snapshotted so historical orders remain accurate.
 */
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  /** The category/package that was purchased (nullable for individual products) */
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "restrict" }),
  /** Discriminator: "product" or "package" */
  itemType: varchar("item_type", { length: 50 }).notNull(),
  /** Snapshot of item name at purchase time */
  itemName: varchar("item_name", { length: 255 }).notNull(),
  /** Snapshot of item image for export/display */
  itemImageUrl: text("item_image_url"),
  quantity: integer("quantity").notNull().default(1),
  /** Price at time of purchase (cents) — immutable after creation */
  unitPriceCents: integer("unit_price_cents").notNull(),
  /** Line total = quantity × unitPriceCents */
  lineTotalCents: integer("line_total_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Invoices — one per order, created by admin with editable prices */
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** One invoice per order */
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" })
    .unique(),
  /** Human-readable invoice number, e.g. INV-2026-0001 */
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  sentAt: timestamp("sent_at"),
  sentToEmail: varchar("sent_to_email", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Invoice line items — admin fills in prices here */
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  /** Links back to the original order item */
  orderItemId: uuid("order_item_id")
    .references(() => orderItems.id, { onDelete: "set null" }),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: integer("quantity").notNull(),
  /** Admin fills this in — starts at 0 */
  unitPriceCents: integer("unit_price_cents").notNull().default(0),
  /** Line total = quantity × unitPriceCents */
  lineTotalCents: integer("line_total_cents").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Email notifications — tracks all emails sent for an order */
export const emailNotifications = pgTable("email_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  /** Role of the recipient: costume-admin, general-admin, info, customer */
  recipientRole: varchar("recipient_role", { length: 50 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  status: emailStatusEnum("status").notNull().default("queued"),
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  category: one(categories, {
    fields: [cartItems.categoryId],
    references: [categories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  invoice: one(invoices, {
    fields: [orders.id],
    references: [invoices.orderId],
  }),
  emailNotifications: many(emailNotifications),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  category: one(categories, {
    fields: [orderItems.categoryId],
    references: [categories.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  }),
  lineItems: many(invoiceLineItems),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
  orderItem: one(orderItems, {
    fields: [invoiceLineItems.orderItemId],
    references: [orderItems.id],
  }),
}));

export const emailNotificationsRelations = relations(emailNotifications, ({ one }) => ({
  order: one(orders, {
    fields: [emailNotifications.orderId],
    references: [orders.id],
  }),
}));
