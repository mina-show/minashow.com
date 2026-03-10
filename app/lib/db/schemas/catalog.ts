import { boolean, integer, jsonb, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

/**
 * Categories — each category is a purchasable package.
 * The 6 stakeholder-defined categories should be seeded:
 *   human-mascots | human-costumes | animal-costumes |
 *   animal-mascots | soundtracks | marionettes
 */
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  /** URL-safe slug — used as route param in /shop/:category */
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  /** Package price in cents (e.g. 10000 = $100.00) */
  priceCents: integer("price_cents").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  /** Controls display order and filter order in the UI */
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Products — individual items displayed within a category package.
 * These are for showcasing what's included; purchasing is done at the category level.
 */
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  /** Array of image URLs: [{ url: string, alt: string }] */
  images: jsonb("images").$type<{ url: string; alt: string }[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));
