import { Link, useFetcher, useSearchParams } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getSessionUser } from "~/lib/auth/session.server";
import { issuePasswordResetToken } from "~/lib/auth/password-reset.server";
import { sendEmail } from "~/lib/email/email-client.server";
import { renderPasswordResetEmail } from "~/lib/email/templates/password-reset.server";
import { serverEnv } from "~/lib/env/env.defaults.server";
import { LogoMark } from "~/components/layout/logo-mark";

export function meta() {
  return [{ title: "Forgot Password — Minashow" }];
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  if (user) throw redirect("/dashboard");
  return {};
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function action({ request }: ActionFunctionArgs) {
  const fd = await request.formData();
  const email = ((fd.get("email") as string) ?? "").toLowerCase().trim();

  if (!email) return { error: "Please enter your email." };

  // Always claim success — we don't reveal whether the address has an account.
  const issued = await issuePasswordResetToken(email);
  if (issued) {
    const protocol = serverEnv.APP_FQDN.includes("localhost") ? "http" : "https";
    const resetUrl = `${protocol}://${serverEnv.APP_FQDN}/reset-password?token=${issued.rawToken}`;
    const tpl = renderPasswordResetEmail({
      userName: issued.user.name,
      resetUrl,
      expiresInMinutes: 60,
    });
    // Don't block on email — we don't want sending failures to leak which
    // addresses exist. The dev fallback in sendEmail logs to console.
    await sendEmail({
      to: issued.user.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
  }

  return redirect("/forgot-password?sent=1");
}

// ─── Component ────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none transition-colors focus:border-primary focus:bg-white font-sans";

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const sent = searchParams.get("sent") === "1";
  const fetcher = useFetcher<{ error?: string }>();
  const loading = fetcher.state !== "idle";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <LogoMark size={40} />
            <span
              className="text-gray-900"
              style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.5rem", fontWeight: 700 }}
            >
              minashow
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-gray-900 mb-2 font-display text-2xl font-semibold">
            Forgot your password?
          </h1>
          <p className="text-gray-500 text-sm font-sans mb-6">
            Enter the email tied to your account and we'll send you a link to reset your password.
          </p>

          {sent ? (
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 mb-4">
              <p className="text-sm text-green-800 font-sans leading-relaxed">
                If that email is in our system, a reset link is on its way. Check your inbox (and spam folder)
                for an email from <span className="font-semibold">tech@minashow.com</span>. The link expires in 1 hour.
              </p>
            </div>
          ) : (
            <fetcher.Form method="post" className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className={inputCls}
                  required
                  autoFocus
                />
              </div>

              {fetcher.data?.error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl font-sans">
                  {fetcher.data.error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-full font-sans font-extrabold transition-colors ${
                  loading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "text-white hover:opacity-90"
                }`}
                style={{ backgroundColor: loading ? undefined : "#202973" }}
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </fetcher.Form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-sans"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
