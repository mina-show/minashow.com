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
 * Cart items — each item is a category package.
 * Quantity is stored for flexibility but will typically be 1 per package.
 */
export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  /** The category/package being purchased */
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull().default(1),
  /** Snapshot of category price (cents) at time of add-to-cart */
  unitPriceCents: integer("unit_price_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Orders — one per checkout */
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Null if guest checked out without creating an account */
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  /** Email captured at checkout (useful for guests and receipts) */
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  /** Subtotal before any discounts/fees (cents) */
  subtotalCents: integer("subtotal_cents").notNull(),
  /** Final charged amount (cents) */
  totalCents: integer("total_cents").notNull(),
  /** Optional customer notes */
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Order items — snapshot of what was purchased.
 * References category (package) — price is snapshotted so historical
 * orders remain accurate even if the package price changes later.
 */
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  /** The category/package that was purchased */
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull().default(1),
  /** Price at time of purchase (cents) — immutable after creation */
  unitPriceCents: integer("unit_price_cents").notNull(),
  /** Line total = quantity × unitPriceCents */
  lineTotalCents: integer("line_total_cents").notNull(),
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
