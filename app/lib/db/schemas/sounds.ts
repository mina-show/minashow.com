import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const soundCategories = pgTable("sound_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sounds = pgTable("sounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  /** Seconds allowed to preview before login is required. Null = no limit. */
  previewDurationSeconds: integer("preview_duration_seconds"),
  thumbnailUrl: text("thumbnail_url"),
  audioUrl: text("audio_url"),
  categoryId: uuid("category_id").references(() => soundCategories.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Flat tag pool shared across all sounds */
export const soundTags = pgTable("sound_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Many-to-many: sounds ↔ tags */
export const soundTagAssignments = pgTable(
  "sound_tag_assignments",
  {
    soundId: uuid("sound_id")
      .notNull()
      .references(() => sounds.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => soundTags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.soundId, t.tagId] })]
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const soundCategoriesRelations = relations(soundCategories, ({ many }) => ({
  sounds: many(sounds),
}));

export const soundsRelations = relations(sounds, ({ one, many }) => ({
  category: one(soundCategories, {
    fields: [sounds.categoryId],
    references: [soundCategories.id],
  }),
  tagAssignments: many(soundTagAssignments),
}));

export const soundTagsRelations = relations(soundTags, ({ many }) => ({
  tagAssignments: many(soundTagAssignments),
}));

export const soundTagAssignmentsRelations = relations(soundTagAssignments, ({ one }) => ({
  sound: one(sounds, {
    fields: [soundTagAssignments.soundId],
    references: [sounds.id],
  }),
  tag: one(soundTags, {
    fields: [soundTagAssignments.tagId],
    references: [soundTags.id],
  }),
}));
