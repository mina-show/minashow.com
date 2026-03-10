import { db } from "~/lib/db/client";
import { sessions } from "~/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

/** Cryptographically secure random session token (64 hex chars) */
function generateSessionId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Creates a 30-day session in the DB and returns the id + expiry. */
export async function createSession(userId: string): Promise<{ id: string; expiresAt: Date }> {
  const id = generateSessionId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id, userId, expiresAt });
  return { id, expiresAt };
}

/** Deletes the session identified by the request's sid cookie. */
export async function deleteSession(request: Request): Promise<void> {
  const cookie = request.headers.get("Cookie") ?? "";
  const sessionId = parseCookie(cookie, SESSION_COOKIE);
  if (sessionId) await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export const SESSION_COOKIE = "sid";

/** Parse a single cookie value from the Cookie header */
function parseCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k === name && v) return decodeURIComponent(v);
  }
  return null;
}

/** Returns the authenticated user attached to the request's session cookie, or null. */
export async function getSessionUser(request: Request) {
  const cookie = request.headers.get("Cookie") ?? "";
  const sessionId = parseCookie(cookie, SESSION_COOKIE);
  if (!sessionId) return null;

  const session = await db.query.sessions.findFirst({
    where: and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())),
    with: { user: true },
  });

  return session?.user ?? null;
}

/** Builds a Set-Cookie header string for a session. */
export function buildSessionCookie(sessionId: string, expiresAt: Date): string {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    `Expires=${expiresAt.toUTCString()}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

/** Builds a Set-Cookie header that clears the session cookie. */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly; SameSite=Lax`;
}
