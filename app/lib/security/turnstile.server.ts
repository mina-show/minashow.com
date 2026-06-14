import { serverEnv } from "~/lib/env/env.defaults.server";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface SiteVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

/**
 * Verify a Cloudflare Turnstile token server-side.
 *
 * Returns `true` when the token is valid. When TURNSTILE_SECRET_KEY is unset
 * (dev convenience), verification is skipped and `true` is returned so local
 * flows aren't blocked. A network/parse failure is treated as a failed
 * verification (fail closed).
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string
): Promise<boolean> {
  const secret = serverEnv.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY unset — skipping verification");
    return true;
  }

  if (!token) return false;

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as SiteVerifyResponse;
    if (!data.success) {
      console.warn("[turnstile] verification failed", data["error-codes"]);
    }
    return data.success;
  } catch (err) {
    console.error("[turnstile] siteverify request failed", err);
    return false;
  }
}
