import { useState } from "react";
import { useSearchParams, Link, useFetcher } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "~/lib/db/client";
import { users, userCredentials } from "~/lib/db/schema";
import { getSessionUser, createSession, buildSessionCookie } from "~/lib/auth/session.server";
import { LogoMark } from "~/components/layout/logo-mark";

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
  const justReset = searchParams.get("reset") === "1";
  const fetcher = useFetcher<{ intent: string; error: string }>();

  const isLogin = activeTab === "login";
  const actionError =
    fetcher.data?.intent === activeTab ? fetcher.data?.error : undefined;
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
            {isLogin ? (
              <fetcher.Form method="post" className="flex flex-col gap-4">
                <input type="hidden" name="intent" value="login" />
                <input type="hidden" name="redirectTo" value={redirectTo} />

                {justReset && (
                  <p className="text-sm text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-xl font-sans">
                    Password updated. Sign in with your new password.
                  </p>
                )}

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

                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-sans text-center"
                >
                  Forgot your password?
                </Link>
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
