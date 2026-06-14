import { z } from "zod";

/**
 * Server environment variables
 *
 * Those prefixed with `PUBLIC_` are available to the client
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  /** Neon Postgres connection string */
  DATABASE_URL: z.string(),
  /**
   * The app environment
   */
  PUBLIC_APP_ENV: z.enum(["development", "production", "preview", "staging"]).default("development"),
  /**
   * The fully qualified domain name of the app (used server-side)
   */
  APP_FQDN: z.string(),
  /**
   * The fully qualified domain name of the app (exposed to client)
   */
  PUBLIC_APP_FQDN: z.string(),
  /**
   * IAM role ARN for Vercel OIDC authentication with AWS
   */
  AWS_ROLE_ARN: z.string(),
  /** Google OAuth 2.0 client ID */
  GOOGLE_CLIENT_ID: z.string().optional(),
  /** Google OAuth 2.0 client secret */
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  /**
   * Resend API key used to send all transactional email.
   * Optional: when unset, the email service runs in log-only mode (dev convenience).
   */
  RESEND_API_KEY: z.string().optional(),
  /**
   * From address for order-related mail (admin routing + customer receipts).
   * e.g. `Minashow Orders <order@minashow.com>` — domain must be verified in Resend.
   */
  EMAIL_FROM_ORDERS: z.string().optional(),
  /**
   * Default from address for general/account mail (contact form, password reset).
   * e.g. `Minashow <info@minashow.com>` — domain must be verified in Resend.
   */
  EMAIL_FROM_INFO: z.string().optional(),
  /**
   * Dev-only override: when set, all admin/info emails (NOT customer receipts) are
   * redirected to this address. Subject is prefixed with the original intended
   * recipient so routing can still be verified visually.
   * Leave unset in production.
   */
  EMAIL_DEV_REDIRECT_TO: z.string().optional(),
  /**
   * Zeffy donation/payment form URL the customer is sent to in order to pay.
   * Used in the payment-request email + PDF. Optional: when unset, the payment
   * email omits the link (dev convenience).
   */
  ZEFFY_LINK: z.string().optional(),
  /**
   * Cloudflare Turnstile site key (public — rendered in the widget).
   * Passed to the client via route loaders. Optional: when unset the widget is
   * not rendered (dev convenience).
   */
  TURNSTILE_SITE_KEY: z.string().optional(),
  /**
   * Cloudflare Turnstile secret key (server-side token verification).
   * Optional: when unset, verification is skipped (dev convenience).
   */
  TURNSTILE_SECRET_KEY: z.string().optional(),
});

const vercelEnv = process.env.VERCEL_ENV;

const appFqdn = process.env.NODE_ENV === "development" ? "localhost:3000" : process.env.APP_FQDN;

const serverEnv = serverEnvSchema.parse({
  ...process.env,
  APP_FQDN: appFqdn,
  PUBLIC_APP_FQDN: appFqdn,
  PUBLIC_APP_ENV: vercelEnv,
});

export { serverEnv };
