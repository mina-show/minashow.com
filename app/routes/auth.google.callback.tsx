import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { eq, and } from "drizzle-orm";
import { db } from "~/lib/db/client";
import { users, oauthAccounts } from "~/lib/db/schema";
import { createSession, buildSessionCookie } from "~/lib/auth/session.server";
import { serverEnv } from "~/lib/env/env.defaults.server";

const CLEAR_STATE_COOKIE = "oauth_state=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly; SameSite=Lax";

function parseCookie(header: string, name: string): string | null {
  for (const part of header.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k === name && v) return decodeURIComponent(v);
  }
  return null;
}

/** Handles the Google OAuth callback, upserts the user, and creates a session. */
export async function loader({ request }: LoaderFunctionArgs) {
  if (!serverEnv.GOOGLE_CLIENT_ID || !serverEnv.GOOGLE_CLIENT_SECRET) {
    throw redirect("/login?error=google_not_configured");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = request.headers.get("Cookie") ?? "";
  const savedState = parseCookie(cookie, "oauth_state");

  if (!code || !state || state !== savedState) {
    throw redirect("/login?error=oauth_failed");
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: serverEnv.GOOGLE_CLIENT_ID,
      client_secret: serverEnv.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${url.origin}/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) throw redirect("/login?error=oauth_token_failed");
  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  // Get Google user info
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileRes.ok) throw redirect("/login?error=oauth_profile_failed");
  const profile = (await profileRes.json()) as {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };

  // Upsert user — find by email first so Google login merges with existing accounts
  let user = await db.query.users.findFirst({ where: eq(users.email, profile.email) });
  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.picture ?? null,
        emailVerifiedAt: new Date(),
      })
      .returning();
  }

  // Upsert OAuth account record
  const tokenExpiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000)
    : null;

  const existingOAuth = await db.query.oauthAccounts.findFirst({
    where: and(
      eq(oauthAccounts.provider, "google"),
      eq(oauthAccounts.providerAccountId, profile.id)
    ),
  });

  if (!existingOAuth) {
    await db.insert(oauthAccounts).values({
      userId: user.id,
      provider: "google",
      providerAccountId: profile.id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      tokenExpiresAt,
    });
  } else {
    await db
      .update(oauthAccounts)
      .set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? existingOAuth.refreshToken,
        tokenExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(oauthAccounts.id, existingOAuth.id));
  }

  // Create session
  const { id: sessionId, expiresAt } = await createSession(user.id);

  const headers = new Headers();
  headers.append("Set-Cookie", buildSessionCookie(sessionId, expiresAt));
  headers.append("Set-Cookie", CLEAR_STATE_COOKIE);

  return redirect("/dashboard", { headers });
}
