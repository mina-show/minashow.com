import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { serverEnv } from "~/lib/env/env.defaults.server";

/** Generates a random CSRF state token */
function generateState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Redirects the user to Google's OAuth consent screen. */
export async function loader({ request }: LoaderFunctionArgs) {
  if (!serverEnv.GOOGLE_CLIENT_ID) {
    throw redirect("/login?error=google_not_configured");
  }

  const base = new URL(request.url).origin;
  const state = generateState();

  const params = new URLSearchParams({
    client_id: serverEnv.GOOGLE_CLIENT_ID,
    redirect_uri: `${base}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, {
    headers: {
      "Set-Cookie": `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
}
