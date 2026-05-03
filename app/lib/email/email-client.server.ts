import nodemailer, { type Transporter } from "nodemailer";
import { serverEnv } from "~/lib/env/env.defaults.server";

/**
 * SMTP transporter, lazily created on first use.
 * Reusing a single transporter pools the connection, which is meaningfully faster
 * than tearing down a new SMTP handshake for every send.
 */
let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;
  if (!serverEnv.GMAIL_USER || !serverEnv.GMAIL_APP_PASSWORD) return null;

  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    // Pooled SMTP keeps the auth handshake warm across sends, which roughly
    // halves total time when fanning out multiple emails per order.
    pool: true,
    maxConnections: 4,
    auth: {
      user: serverEnv.GMAIL_USER,
      pass: serverEnv.GMAIL_APP_PASSWORD,
    },
  });
  return cachedTransporter;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  /** Plain text fallback for clients that don't render HTML */
  text?: string;
  replyTo?: string;
  bcc?: string;
}

export interface SendEmailResult {
  success: boolean;
  /** Provider message id when the email was actually sent (null in log-only mode) */
  messageId: string | null;
  /** Error message if the send failed */
  error: string | null;
  /** True when no SMTP creds were configured and the email was logged to console only */
  loggedOnly: boolean;
}

/**
 * Send a transactional email via Gmail SMTP.
 *
 * If GMAIL_USER / GMAIL_APP_PASSWORD aren't set, the email is logged to console and
 * `loggedOnly: true` is returned — letting the order flow run end-to-end in dev
 * without real credentials.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const transporter = getTransporter();
  const from =
    serverEnv.GMAIL_FROM ?? serverEnv.GMAIL_USER ?? "noreply@minashow.com";

  if (!transporter) {
    console.log("[email:log-only]", {
      from,
      to: input.to,
      bcc: input.bcc,
      subject: input.subject,
      replyTo: input.replyTo,
    });
    return {
      success: true,
      messageId: null,
      error: null,
      loggedOnly: true,
    };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: input.to,
      bcc: input.bcc,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    return {
      success: true,
      messageId: info.messageId,
      error: null,
      loggedOnly: false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email:send-failed]", {
      to: input.to,
      subject: input.subject,
      error: message,
    });
    return {
      success: false,
      messageId: null,
      error: message,
      loggedOnly: false,
    };
  }
}
