# Launch Punch List

Running list of work needed to ship the site. Updated as we go.

---

## Goals (from product owner)

1. **Order intake + admin email routing** — When an order is placed, Maged and Ghada receive the right items in their inboxes.
2. **Admin order-management dashboard** — A place for them to view orders and move them through fulfillment.
3. **Contact form → info inbox via SES** — Submissions email `info@minashow.com`.
4. **One-click invoice generation** — Admin fills in actual item costs for an order, presses a button, and a proper invoice is generated.
5. **End-to-end order flow audit** — Ensure the entire purchase flow is correct and that we collect the right customer information.

---

## Current state (audit, 2026-05-14)

### 1. Order intake + admin email routing — ✅ Mostly done

- `app/lib/actions/submit-order/action-handler.server.ts` writes the order + items, clears the cart, then calls `routeOrderEmails`.
- `app/lib/email/order-email-router.server.ts` splits the cart by category:
  - Costume items → `ghadaa@minashow.com`
  - Non-costume items → `magedw@minashow.com`
  - Full summary → `info@minashow.com`
  - BCC archive → `tech@minashow.com`
  - Customer receipt → the email captured at checkout
- Every send is recorded in `email_notifications` with `queued | sent | failed` status.
- Transport: Gmail SMTP via Nodemailer (`app/lib/email/email-client.server.ts`).

**Gaps / questions:**
- Confirm `ghadaa@minashow.com` and `magedw@minashow.com` are the final addresses (and the cutover from Gmail SMTP to SES — see item 3 — is decided).
- "Costume" detection is a substring match on the item's category string. Verify the seed/catalog categories actually contain the word "costume" wherever Ghada should be routed; if not, switch to a category ID allowlist.
- No retry UI for failed email sends yet — the table is there, the admin surface isn't.

### 2. Admin order-management dashboard — ✅ Done for status, ❌ no invoice UI

- `app/routes/_layout.admin.tsx` (831 lines) has sections for Orders, Categories, Products, Sounds.
- Orders section supports status transitions: `pending → confirmed → processing → shipped → delivered`, plus `cancelled / refunded`.
- Admin gate enforced by `requireAdmin` in the loader.

**Gaps:**
- No invoice UI inside admin (see item 4).
- No view of `email_notifications` per order (would help debug failed sends).

### 3. Contact form → SES — ❌ Not wired

- `app/routes/_layout.contact.tsx:28` currently just flips `submitted = true` — no email is sent. Comment says "Phase 3: wire to AWS SES".
- We already have a working Gmail SMTP sender; decision needed: keep Gmail SMTP for everything, or move all transactional mail to SES.

**To do:**
- Decide transport (SES vs Gmail SMTP).
- Build a server action (or plain route action) that validates the form and emails `info@minashow.com`. BCC archive consistent with order emails.
- If SES: add `@aws-sdk/client-sesv2`, env vars for region/sender identity, and confirm the sender domain in SES.

### 4. One-click invoice generation — ❌ Schema only, no UI / no PDF

- DB schema is already in place: `invoices` + `invoice_line_items` (`app/lib/db/schemas/commerce.ts`). Status enum is `draft | sent | paid`. Line items snapshot back to `order_items` and start at `unitPriceCents = 0`.
- No admin UI to create/edit/send an invoice. No PDF generation. No "send invoice" email template.

**To do:**
- Admin order detail view: list order items with editable price inputs.
- "Generate invoice" button → server action that creates `invoices` (with next `INV-YYYY-NNNN`) and seeds `invoice_line_items` from `order_items` at admin-entered prices.
- PDF generation. Options:
  - Server-side PDF (e.g. `@react-pdf/renderer` or a headless Chrome) — preferred for consistent branded output.
  - Or HTML invoice + "Save as PDF" — cheaper, less polished.
- "Send invoice" action — emails the customer with PDF attached (or link), stamps `invoices.status = sent`, `sentAt`, `sentToEmail`.
- Manual "Mark as paid" toggle (until/unless we integrate Zeffy callbacks).

### 5. End-to-end flow audit — ⚠️ Mostly correct, a few items to verify

- Customer info captured at checkout: `customerName, customerOrganization, customerEmail, customerPhone, shippingAddress, notes`. Looks complete for a fulfillment + invoice workflow.
- Subtotal and total are both populated from cart prices at submit time (no shipping/tax math yet — confirm whether we need either before launch).
- Admins are blocked from placing orders (handler returns a `ReadableError`). Good.
- Server-side cart clear after order submit closes the debounced-sync race. Good.
- Confirmation page tells the customer to expect a Zeffy donation link from an admin within 1–2 business days. Confirm that messaging stays correct once invoice flow lands (the language should probably shift from "Zeffy payment link" to "invoice").

---

## In-flight work (uncommitted on `staging`)

- **Password reset flow** — `forgot-password.tsx`, `reset-password.tsx`, `app/lib/auth/password-reset.server.ts`, password-reset email template, `passwordResetTokens` table added to `auth.ts`, login + cart-provider tweaks, `merge-guest-cart` action removed.
- Needs: Drizzle migration for the new `password_reset_tokens` table, then commit.

---

## Open questions for the product owner

1. **Email transport** — Move everything to SES (one provider, better deliverability, costs more setup) or keep Gmail SMTP and just point the contact form at it?
2. **Invoice numbering** — Continue `INV-YYYY-NNNN` per year, or a single rolling sequence?
3. **Invoice delivery** — PDF attached to the email, or hosted link to download? (Attached is friendlier for accountants.)
4. **Payment confirmation** — Stay manual ("Mark as paid" in admin), or integrate with Zeffy / another processor?
5. **Shipping / tax** — Any need to compute shipping or tax at checkout, or is the cart price already final?
6. **Confirmation page wording** — Keep referring to "Zeffy payment link" or switch to "invoice"?
