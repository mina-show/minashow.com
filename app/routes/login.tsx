import { useState } from "react";
import { useNavigate, useSearchParams, Link, useFetcher } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "~/lib/db/client";
import { users, userCredentials } from "~/lib/db/schema";
import { getSessionUser, createSession, buildSessionCookie } from "~/lib/auth/session.server";
import { LogoMark } from "~/components/layout/logo-mark";
import { serverEnv } from "~/lib/env/env.defaults.server";

export function meta() {
  return [{ title: "Sign In — Minashow" }];
}

// ─── Loader ───────────────────────────────────────────────────────────────────

/** Redirect already-logged-in users away from the login page */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  if (user) throw redirect("/dashboard");
  return {};
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function action({ request }: ActionFunctionArgs) {
  const fd = await request.formData();
  const intent = fd.get("intent") as string;
  const redirectTo = (fd.get("redirectTo") as string) || "/dashboard";

  // ── Email / password login ─────────────────────────────────────────────────
  if (intent === "login") {
    const email = ((fd.get("email") as string) ?? "").toLowerCase().trim();
    const password = (fd.get("password") as string) ?? "";

    if (!email || !password)
      return { intent, error: "Email and password are required." };

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: { credentials: true },
    });

    const valid =
      user?.credentials &&
      (await bcrypt.compare(password, user.credentials.passwordHash));

    if (!valid) return { intent, error: "Invalid email or password." };

    const { id, expiresAt } = await createSession(user!.id);
    return redirect(redirectTo, {
      headers: { "Set-Cookie": buildSessionCookie(id, expiresAt) },
    });
  }

  // ── Registration ───────────────────────────────────────────────────────────
  if (intent === "register") {
    const name = ((fd.get("name") as string) ?? "").trim();
    const email = ((fd.get("email") as string) ?? "").toLowerCase().trim();
    const password = (fd.get("password") as string) ?? "";
    const confirm = (fd.get("confirm") as string) ?? "";

    if (!name || !email || !password)
      return { intent, error: "All fields are required." };
    if (!/\S+@\S+\.\S+/.test(email))
      return { intent, error: "Please enter a valid email." };
    if (password.length < 6)
      return { intent, error: "Password must be at least 6 characters." };
    if (password !== confirm)
      return { intent, error: "Passwords do not match." };

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existing) return { intent, error: "An account with this email already exists." };

    const passwordHash = await bcrypt.hash(password, 12);
    const [newUser] = await db.insert(users).values({ name, email }).returning();
    await db.insert(userCredentials).values({ userId: newUser.id, passwordHash });

    const { id, expiresAt } = await createSession(newUser.id);
    return redirect("/dashboard", {
      headers: { "Set-Cookie": buildSessionCookie(id, expiresAt) },
    });
  }

  return { intent: "login", error: "Unknown action." };
}

// ─── Component ────────────────────────────────────────────────────────────────

type RegFields = "name" | "email" | "password" | "confirm";

const REG_FIELDS: { field: RegFields; label: string; type: string; placeholder: string }[] = [
  { field: "name", label: "Full name", type: "text", placeholder: "Your name" },
  { field: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { field: "password", label: "Password", type: "password", placeholder: "••••••••" },
  { field: "confirm", label: "Confirm password", type: "password", placeholder: "••••••••" },
];

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none transition-colors focus:border-primary focus:bg-white font-sans";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login"
  );
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const fetcher = useFetcher<{ intent: string; error: string }>();

  const isLogin = activeTab === "login";
  const actionError =
    fetcher.data?.intent === activeTab ? fetcher.data?.error : undefined;
  const loading = fetcher.state !== "idle";

  const googleEnabled = true; // env vars control actual availability on server

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

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(["login", "register"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm transition-all font-sans ${
                  activeTab === tab ? "border-b-2" : "text-gray-500 hover:text-gray-700"
                }`}
                style={{
                  fontWeight: activeTab === tab ? 700 : undefined,
                  color: activeTab === tab ? "#202973" : undefined,
                  borderColor: activeTab === tab ? "#202973" : undefined,
                  backgroundColor: activeTab === tab ? "#EFF6FF" : undefined,
                }}
              >
                {tab === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {/* Google OAuth button */}
            {googleEnabled && (
              <>
                <a
                  href="/auth/google"
                  className="flex items-center justify-center gap-3 w-full py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors font-sans font-semibold text-gray-700 text-sm mb-4"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </a>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-sans">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </>
            )}

            {isLogin ? (
              <fetcher.Form method="post" className="flex flex-col gap-4">
                <input type="hidden" name="intent" value="login" />
                <input type="hidden" name="redirectTo" value={redirectTo} />

                <div>
                  <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
                    Email
                  </label>
                  <input name="email" type="email" placeholder="you@example.com" className={inputCls} required />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
                    Password
                  </label>
                  <input name="password" type="password" placeholder="••••••••" className={inputCls} required />
                </div>

                {actionError && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl font-sans">
                    {actionError}
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
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </fetcher.Form>
            ) : (
              <fetcher.Form method="post" className="flex flex-col gap-4">
                <input type="hidden" name="intent" value="register" />
                <input type="hidden" name="redirectTo" value={redirectTo} />

                {REG_FIELDS.map(({ field, label, type, placeholder }) => (
                  <div key={field}>
                    <label className="block text-gray-700 text-sm mb-1.5 font-sans font-bold">
                      {label}
                    </label>
                    <input name={field} type={type} placeholder={placeholder} className={inputCls} required />
                  </div>
                ))}

                {actionError && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl font-sans">
                    {actionError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full text-white transition-colors hover:opacity-90 font-sans font-extrabold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#202973" }}
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </fetcher.Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
