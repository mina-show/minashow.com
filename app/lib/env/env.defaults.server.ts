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
   * Gmail account used to send transactional emails via SMTP.
   * Must be a Workspace user with 2FA + an app password generated.
   * Optional: when unset, the email service runs in log-only mode (dev convenience).
   */
  GMAIL_USER: z.string().optional(),
  /** App password for the GMAIL_USER account (16 chars, generated at myaccount.google.com/apppasswords) */
  GMAIL_APP_PASSWORD: z.string().optional(),
  /** From address for outbound mail. Must equal GMAIL_USER or be a Gmail "send-as" alias of it. Defaults to GMAIL_USER. */
  GMAIL_FROM: z.string().optional(),
  /**
   * Dev-only override: when set, all admin/info emails (NOT customer receipts) are
   * redirected to this address. Subject is prefixed with the original intended
   * recipient so routing can still be verified visually.
   * Leave unset in production.
   */
  EMAIL_DEV_REDIRECT_TO: z.string().optional(),
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
