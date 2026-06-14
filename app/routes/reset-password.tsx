import { Link, useFetcher, useLoaderData, useSearchParams } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import {
  consumePasswordResetToken,
  validatePasswordResetToken,
} from "~/lib/auth/password-reset.server";
import { LogoMark } from "~/components/layout/logo-mark";

export function meta() {
  return [{ title: "Reset Password — Minashow" }];
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const validated = await validatePasswordResetToken(token);
  return { tokenValid: !!validated };
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function action({ request }: ActionFunctionArgs) {
  const fd = await request.formData();
  const token = (fd.get("token") as string) ?? "";
  const password = (fd.get("password") as string) ?? "";
  const confirm = (fd.get("confirm") as string) ?? "";

  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const validated = await validatePasswordResetToken(token);
  if (!validated) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  await consumePasswordResetToken({
    tokenId: validated.tokenId,
    userId: validated.userId,
    newPlainTextPassword: password,
  });

  return redirect("/login?reset=1");
}

// ─── Component ────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none transition-colors focus:border-primary focus:bg-white font-sans";

export default function ResetPasswordPage() {
  const { tokenValid } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const fetcher = useFetcher<{ error?: string }>();
  const loading = fetcher.state !== "idle";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
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
          {!tokenValid ? (
            <>
              <h1 className="text-gray-900 mb-2 font-display text-2xl font-semibold">
                Link expired or invalid
              </h1>
              <p className="text-gray-500 text-sm font-sans mb-6 leading-relaxed">
                This reset link is no longer valid. It may have already been used or expired (links work for 1 hour).
                Request a new one to continue.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center w-full py-3 rounded-full font-sans font-extrabold text-white hover:opacity-90 transition-colors"
                style={{ backgroundColor: "#202973" }}
              >
                Request a new reset link
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-gray-900 mb-2 font-display text-2xl font-semibold">
                Choose a new password
              </h1>
              <p className="text-gray-500 text-sm font-sans mb-6">
                Pick something at least 6 characters long.
              </p>

              <fetcher.Form method="post" className="flex flex-col gap-4">
                <input type="hidden" name="token" value={token} />
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
                    New password
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className={inputCls}
                    required
                    minLength={6}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
                    Confirm password
                  </label>
                  <input
                    name="confirm"
                    type="password"
                    placeholder="••••••••"
                    className={inputCls}
                    required
                    minLength={6}
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
                  {loading ? "Updating…" : "Update password"}
                </button>
              </fetcher.Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
