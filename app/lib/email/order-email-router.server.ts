import { db } from "~/lib/db/client";
import { emailNotifications } from "~/lib/db/schema";
import { serverEnv } from "~/lib/env/env.defaults.server";
import { sendEmail } from "./email-client.server";
import {
  renderAdminOrderEmail,
  renderCustomerReceiptEmail,
  type EmailOrderContext,
  type EmailOrderItem,
} from "./templates/order-emails.server";

const COSTUME_ADMIN = "ghadaa@minashow.com";
const GENERAL_ADMIN = "magedw@minashow.com";
const INFO_ADDRESS = "info@minashow.com";
/** Internal archival recipient — silently BCC'd on every order email. */
const ARCHIVE_BCC = "tech@minashow.com";

/**
 * Dev override: when EMAIL_DEV_REDIRECT_TO is set, all admin/info emails go to
 * that address instead of the real admins. Customer receipts are never redirected
 * — the customer email comes from the order form so it's already the tester.
 */
function applyDevRedirect(
  intendedRecipient: string,
  role: "costume-admin" | "general-admin" | "info" | "customer",
  subject: string
): { recipient: string; subject: string } {
  const override = serverEnv.EMAIL_DEV_REDIRECT_TO;
  if (!override || role === "customer") {
    return { recipient: intendedRecipient, subject };
  }
  return {
    recipient: override,
    subject: `[DEV → ${intendedRecipient}] ${subject}`,
  };
}

/** True when the item's category string suggests it's a costume. */
function isCostumeItem(item: EmailOrderItem): boolean {
  return item.category.toLowerCase().includes("costume");
}

interface PlannedSend {
  recipientEmail: string;
  recipientRole: "costume-admin" | "general-admin" | "info" | "customer";
  subject: string;
  html: string;
  text: string;
  /** Reply-To gives admins a one-click path back to the customer */
  replyTo?: string;
}

/**
 * Fan out order notifications:
 *   - costume admin gets the costume items only (if any)
 *   - general admin gets the non-costume items only (if any)
 *   - info@ always gets the full summary
 *   - customer always gets a receipt
 *
 * Sends in parallel via Promise.allSettled so a single SMTP failure doesn't
 * cascade. Each attempt is recorded in the email_notifications table.
 *
 * Returns a comma-separated list of admin emails that were notified — useful
 * for stamping `orders.assignedAdmin`.
 */
export async function routeOrderEmails(
  context: EmailOrderContext
): Promise<{ assignedAdmin: string }> {
  const costumeItems = context.items.filter(isCostumeItem);
  const generalItems = context.items.filter((i) => !isCostumeItem(i));

  const planned: PlannedSend[] = [];

  if (costumeItems.length > 0) {
    const tpl = renderAdminOrderEmail({
      context,
      itemsForRecipient: costumeItems,
      scope: "Costume items",
    });
    planned.push({
      recipientEmail: COSTUME_ADMIN,
      recipientRole: "costume-admin",
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      replyTo: context.customerEmail,
    });
  }

  if (generalItems.length > 0) {
    const tpl = renderAdminOrderEmail({
      context,
      itemsForRecipient: generalItems,
      scope: "Non-costume items",
    });
    planned.push({
      recipientEmail: GENERAL_ADMIN,
      recipientRole: "general-admin",
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      replyTo: context.customerEmail,
    });
  }

  // info@ catch-all — always full summary
  {
    const tpl = renderAdminOrderEmail({
      context,
      itemsForRecipient: context.items,
      scope: "All items",
    });
    planned.push({
      recipientEmail: INFO_ADDRESS,
      recipientRole: "info",
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      replyTo: context.customerEmail,
    });
  }

  // Customer receipt
  {
    const tpl = renderCustomerReceiptEmail(context);
    planned.push({
      recipientEmail: context.customerEmail,
      recipientRole: "customer",
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
  }

  // Apply dev redirect (no-op in production)
  const dispatched = planned.map((p) => {
    const { recipient, subject } = applyDevRedirect(
      p.recipientEmail,
      p.recipientRole,
      p.subject
    );
    return { ...p, dispatchedTo: recipient, dispatchedSubject: subject };
  });

  // Fan-out — never throws; each result is captured for DB logging.
  const results = await Promise.allSettled(
    dispatched.map((p) =>
      sendEmail({
        to: p.dispatchedTo,
        subject: p.dispatchedSubject,
        html: p.html,
        text: p.text,
        replyTo: p.replyTo,
        bcc: ARCHIVE_BCC,
      })
    )
  );

  // Log rows reflect the *intended* recipient/subject so the admin UI keeps
  // showing the routing rule that was applied — not the dev override.
  const rows = dispatched.map((p, idx) => {
    const settled = results[idx];
    if (settled.status === "fulfilled") {
      const r = settled.value;
      return {
        orderId: context.orderId,
        recipientEmail: p.recipientEmail,
        recipientRole: p.recipientRole,
        subject: p.subject,
        status: r.success ? ("sent" as const) : ("failed" as const),
        sentAt: r.success ? new Date() : null,
        errorMessage: r.error,
      };
    }
    const reason =
      settled.reason instanceof Error
        ? settled.reason.message
        : String(settled.reason);
    return {
      orderId: context.orderId,
      recipientEmail: p.recipientEmail,
      recipientRole: p.recipientRole,
      subject: p.subject,
      status: "failed" as const,
      sentAt: null,
      errorMessage: reason,
    };
  });

  await db.insert(emailNotifications).values(rows);

  const assignedAdmin = planned
    .filter((p) => p.recipientRole === "costume-admin" || p.recipientRole === "general-admin")
    .map((p) => p.recipientEmail)
    .join(",");

  return { assignedAdmin };
}
