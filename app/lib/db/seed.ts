/**
 * Database seed script
 * Run via: task db:seed
 *
 * Creates:
 *  - 1 admin user (email set via ADMIN_EMAIL / ADMIN_PASSWORD env vars)
 *  - 6 product categories
 *  - 3 sound categories
 */
import { db } from "./client";
import {
  users,
  userCredentials,
  categories,
} from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@minashow.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "change-me-in-production";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Minashow Admin";

// ─── Product categories ────────────────────────────────────────────────────
const PRODUCT_CATEGORIES = [
  {
    name: "Human Mascots",
    slug: "human-mascots",
    description: "Full-body human character mascot suits for live performances.",
    priceCents: 0,
    sortOrder: 1,
  },
  {
    name: "Human Costumes",
    slug: "human-costumes",
    description: "Costumes designed for human actors and performers.",
    priceCents: 0,
    sortOrder: 2,
  },
  {
    name: "Animal Costumes",
    slug: "animal-costumes",
    description: "Fun and vibrant animal costume sets for kids' shows.",
    priceCents: 0,
    sortOrder: 3,
  },
  {
    name: "Animal Mascots",
    slug: "animal-mascots",
    description: "Full-body animal mascot suits for high-energy entertainment.",
    priceCents: 0,
    sortOrder: 4,
  },
  {
    name: "Soundtracks",
    slug: "soundtracks",
    description: "Original Arabic kids' praise and show music.",
    priceCents: 0,
    sortOrder: 5,
  },
  {
    name: "Marionettes",
    slug: "marionettes",
    description: "Handcrafted marionette puppets for storytelling performances.",
    priceCents: 0,
    sortOrder: 6,
  },
] as const;

// ─── Seed ─────────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Seeding database...\n");

  // ── Admin user ────────────────────────────────────────────────────────────
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, ADMIN_EMAIL),
  });

  if (existingAdmin) {
    console.log(`⚠️  Admin user already exists: ${ADMIN_EMAIL}`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const [admin] = await db
      .insert(users)
      .values({ email: ADMIN_EMAIL, name: ADMIN_NAME, role: "admin" })
      .returning();

    await db.insert(userCredentials).values({
      userId: admin.id,
      passwordHash,
    });

    console.log(`✅ Created admin user: ${ADMIN_EMAIL}`);
  }

  // ── Product categories ───────────────────────────────────────────────────
  for (const cat of PRODUCT_CATEGORIES) {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, cat.slug),
    });
    if (existing) {
      console.log(`⚠️  Category already exists: ${cat.name}`);
    } else {
      await db.insert(categories).values(cat);
      console.log(`✅ Created category: ${cat.name}`);
    }
  }

  console.log("\n🎉 Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
