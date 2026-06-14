import { useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { Turnstile } from "@marsidev/react-turnstile";
import { Mail, MessageSquare, CheckCircle } from "lucide-react";
import { RevealEmail } from "~/components/misc/reveal-email";
import { sendEmail } from "~/lib/email/email-client.server";
import { renderContactEmail } from "~/lib/email/templates/contact.server";
import { verifyTurnstileToken } from "~/lib/security/turnstile.server";
import { serverEnv } from "~/lib/env/env.defaults.server";

export function meta() {
  return [{ title: "Contact — Minashow" }];
}

/** Where contact submissions land, plus the silent archival copy. */
const INFO_ADDRESS = "info@minashow.com";
const ARCHIVE_BCC = "tech@minashow.com";

const EMAIL_RE = /\S+@\S+\.\S+/;

type FieldErrors = { name?: string; email?: string; message?: string };
type ActionResult =
  | { ok: true }
  | { ok: false; errors?: FieldErrors; formError?: string };

// ─── Loader ─────────────────────────────────────────────────────────────────

export function loader() {
  // Site key is public — safe to ship to the client to render the widget.
  return { turnstileSiteKey: serverEnv.TURNSTILE_SITE_KEY ?? null };
}

// ─── Action ─────────────────────────────────────────────────────────────────

export async function action({ request }: ActionFunctionArgs): Promise<ActionResult> {
  const fd = await request.formData();
  const name = ((fd.get("name") as string) ?? "").trim();
  const email = ((fd.get("email") as string) ?? "").trim();
  const subject = ((fd.get("subject") as string) ?? "").trim();
  const message = ((fd.get("message") as string) ?? "").trim();
  const turnstileToken = (fd.get("cf-turnstile-response") as string) ?? "";

  // Bot gate first — don't waste work on unverified submissions.
  const remoteIp = request.headers.get("CF-Connecting-IP") ?? undefined;
  const verified = await verifyTurnstileToken(turnstileToken, remoteIp);
  if (!verified) {
    return { ok: false, formError: "Verification failed. Please try again." };
  }

  // Server-side validation mirrors the client gate (defense in depth).
  const errors: FieldErrors = {};
  if (!name) errors.name = "Required";
  if (!email) errors.email = "Required";
  else if (!EMAIL_RE.test(email)) errors.email = "Invalid email";
  if (!message) errors.message = "Required";
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const tpl = renderContactEmail({ name, email, subject, message });
  await sendEmail({
    to: INFO_ADDRESS,
    bcc: ARCHIVE_BCC,
    // Reply-To = the visitor, so staff can respond in one click.
    replyTo: email,
    from: serverEnv.EMAIL_FROM_INFO,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });

  return { ok: true };
}

// ─── Component ────────────────────────────────────────────────────────────────

type FormState = { name: string; email: string; subject: string; message: string };

export default function ContactPage() {
  const { turnstileSiteKey } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionResult>();
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  // Turnstile token, populated by the widget's onSuccess. Required to submit.
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const submitted = fetcher.data?.ok === true;
  const isSubmitting = fetcher.state === "submitting";
  // Server-returned validation errors (rare — client gate catches most).
  const serverErrors = fetcher.data && !fetcher.data.ok ? fetcher.data.errors : undefined;
  const formError = fetcher.data && !fetcher.data.ok ? fetcher.data.formError : undefined;
  // Block submit until the visitor clears Turnstile (unless it isn't configured).
  const needsTurnstile = Boolean(turnstileSiteKey);
  const canSubmit = !isSubmitting && (!needsTurnstile || Boolean(turnstileToken));

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!EMAIL_RE.test(form.email)) e.email = "Invalid email";
    if (!form.message.trim()) e.message = "Required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    // fetcher.submit serializes a plain object, so the widget's hidden input is
    // not auto-included — pass the token explicitly under Cloudflare's field name.
    fetcher.submit(
      { ...form, "cf-turnstile-response": turnstileToken ?? "" },
      { method: "post" }
    );
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field as keyof FieldErrors]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const fieldError = (field: keyof FieldErrors) => errors[field] ?? serverErrors?.[field];

  const inputCls = (error?: string) =>
    `w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:border-brand-orange focus:bg-white font-sans ${error ? "border-red-300" : "border-gray-200"
    }`;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#fdb76133" }}
          >
            <CheckCircle className="w-10 h-10 text-brand-orange" />
          </div>
          <h2
            className="text-gray-900 mb-3"
            style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.75rem", fontWeight: 700 }}
          >
            Message sent!
          </h2>
          <p className="text-gray-600 mb-6 font-sans" style={{ lineHeight: 1.7 }}>
            Thank you for reaching out. We'll get back to you as soon as we can.
          </p>
          <button
            onClick={() => {
              setForm({ name: "", email: "", subject: "", message: "" });
              setTurnstileToken(null);
              fetcher.load("/contact");
            }}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-sans"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="relative py-14 bg-brand-orange">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5" style={{ color: "#713F12" }} />
            </div>
            <h1
              className="text-white"
              style={{ fontFamily: "Fredoka, sans-serif", fontSize: "2.25rem", fontWeight: 700 }}
            >
              Contact
            </h1>
          </div>
          <p className="max-w-xl font-sans" style={{ lineHeight: 1.7, color: "#ffffff" }}>
            Have a question about an order, a product, or our team? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <fetcher.Form
          method="post"
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your name"
                className={inputCls(fieldError("name"))}
              />
              {fieldError("name") && (
                <p className="text-red-500 text-xs mt-1 font-sans">{fieldError("name")}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="you@example.com"
                className={inputCls(fieldError("email"))}
              />
              {fieldError("email") && (
                <p className="text-red-500 text-xs mt-1 font-sans">{fieldError("email")}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
              Subject{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="e.g. Order question"
              className={inputCls()}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
              Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="How can we help?"
              rows={5}
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-gray-900 outline-none transition-colors focus:border-brand-orange focus:bg-white resize-none font-sans ${fieldError("message") ? "border-red-300" : "border-gray-200"
                }`}
            />
            {fieldError("message") && (
              <p className="text-red-500 text-xs mt-1 font-sans">{fieldError("message")}</p>
            )}
          </div>

          {turnstileSiteKey && (
            <Turnstile
              siteKey={turnstileSiteKey}
              options={{ size: "flexible" }}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />
          )}

          {formError && (
            <p className="text-red-500 text-sm font-sans text-center">{formError}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-full transition-colors hover:opacity-90 font-sans font-extrabold disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--brand-orange)" }}
          >
            <MessageSquare className="w-4 h-4" />
            {isSubmitting ? "Sending…" : "Send message"}
          </button>
        </fetcher.Form>

        {/* Direct contact */}
        <div className="mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-gray-500 text-sm mb-1 font-sans">Email us directly</p>
            <RevealEmail
              user="info"
              domain="minashow.com"
              className="inline-flex items-center gap-2 font-semibold transition-colors hover:opacity-80 font-sans text-brand-orange"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
