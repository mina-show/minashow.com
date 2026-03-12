import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const sounds = pgTable("sounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  /** Seconds allowed to preview before login is required. Null = no limit. */
  previewDurationSeconds: integer("preview_duration_seconds"),
  thumbnailUrl: text("thumbnail_url"),
  audioUrl: text("audio_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
