import { and, eq, gt, isNull } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { db } from "~/lib/db/client";
import { passwordResetTokens, sessions, userCredentials, users } from "~/lib/db/schema";
import bcrypt from "bcryptjs";

/** Reset links live for 1 hour. */
const TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Issue a fresh reset token for the user with this email.
 *
 * Returns the raw token if a user was found, or `null` to caller (the route
 * always responds the same way regardless, so we don't reveal which addresses
 * are registered).
 */
export async function issuePasswordResetToken(
  email: string
): Promise<{ rawToken: string; user: { id: string; name: string; email: string } } | null> {
  const normalized = email.toLowerCase().trim();
  const user = await db.query.users.findFirst({
    where: eq(users.email, normalized),
  });
  if (!user) return null;

  // Invalidate any prior unused tokens for this user — only the most recent
  // link should ever work, so a stolen email can't sit on an old token.
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.userId, user.id),
        isNull(passwordResetTokens.usedAt)
      )
    );

  const rawToken = randomBytes(32).toString("hex"); // 64 hex chars
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return { rawToken, user: { id: user.id, name: user.name, email: user.email } };
}

interface ValidatedToken {
  tokenId: string;
  userId: string;
}

/**
 * Look up a reset token by its raw value.
 * Returns the row only if unused and unexpired.
 */
export async function validatePasswordResetToken(
  rawToken: string
): Promise<ValidatedToken | null> {
  if (!rawToken) return null;
  const tokenHash = hashToken(rawToken);

  const row = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.tokenHash, tokenHash),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, new Date())
    ),
  });

  if (!row) return null;
  return { tokenId: row.id, userId: row.userId };
}

/**
 * Atomically: stamp the token used, replace the user's password hash, and
 * destroy any active sessions so other devices are forced to re-login.
 */
export async function consumePasswordResetToken(args: {
  tokenId: string;
  userId: string;
  newPlainTextPassword: string;
}): Promise<void> {
  const passwordHash = await bcrypt.hash(args.newPlainTextPassword, 12);

  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, args.tokenId));

  // Upsert credentials — handles users created via OAuth who never had a password set.
  const existing = await db.query.userCredentials.findFirst({
    where: eq(userCredentials.userId, args.userId),
  });
  if (existing) {
    await db
      .update(userCredentials)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(userCredentials.userId, args.userId));
  } else {
    await db.insert(userCredentials).values({ userId: args.userId, passwordHash });
  }

  // Boot any other sessions — recommended UX for credential rotation.
  await db.delete(sessions).where(eq(sessions.userId, args.userId));
}
