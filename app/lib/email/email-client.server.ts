import { Resend } from "resend";
import { serverEnv } from "~/lib/env/env.defaults.server";

/**
 * Resend client, lazily created on first use so the module can be imported in
 * environments where no API key is configured (dev / tests) without throwing.
 */
let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  if (cachedClient) return cachedClient;
  if (!serverEnv.RESEND_API_KEY) return null;

  cachedClient = new Resend(serverEnv.RESEND_API_KEY);
  return cachedClient;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  /** Plain text fallback for clients that don't render HTML */
  text?: string;
  replyTo?: string;
  bcc?: string;
  /**
   * Override the from address. Defaults to EMAIL_FROM_INFO (general/account mail).
   * Order mail passes EMAIL_FROM_ORDERS.
   */
  from?: string;
  /** File attachments (e.g. invoice/receipt PDFs). `content` is the raw file bytes. */
  attachments?: { filename: string; content: Buffer }[];
}

export interface SendEmailResult {
  success: boolean;
  /** Provider message id when the email was actually sent (null in log-only mode) */
  messageId: string | null;
  /** Error message if the send failed */
  error: string | null;
  /** True when no API key was configured and the email was logged to console only */
  loggedOnly: boolean;
}

/**
 * Send a transactional email via Resend.
 *
 * If RESEND_API_KEY isn't set, the email is logged to console and
 * `loggedOnly: true` is returned — letting flows run end-to-end in dev without
 * real credentials.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const client = getClient();
  const from =
    input.from ?? serverEnv.EMAIL_FROM_INFO ?? "Minashow <info@minashow.com>";

  if (!client) {
    console.log("[email:log-only]", {
      from,
      to: input.to,
      bcc: input.bcc,
      subject: input.subject,
      replyTo: input.replyTo,
      attachments: input.attachments?.map((a) => a.filename),
    });
    return {
      success: true,
      messageId: null,
      error: null,
      loggedOnly: true,
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: input.to,
      bcc: input.bcc,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
      attachments: input.attachments,
    });

    if (error) {
      console.error("[email:send-failed]", {
        to: input.to,
        subject: input.subject,
        error: error.message,
      });
      return {
        success: false,
        messageId: null,
        error: error.message,
        loggedOnly: false,
      };
    }

    return {
      success: true,
      messageId: data?.id ?? null,
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
