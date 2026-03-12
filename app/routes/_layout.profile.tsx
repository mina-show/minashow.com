import { useFetcher, useLoaderData, Link } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { User, Lock, Mail, Calendar, Shield, ArrowLeft } from "lucide-react";
import { db } from "~/lib/db/client";
import { users, userCredentials } from "~/lib/db/schema";
import { getSessionUser } from "~/lib/auth/session.server";

export function meta() {
  return [{ title: "Profile — Minashow" }];
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser) throw redirect("/login?redirectTo=/dashboard/profile");

  const fullUser = await db.query.users.findFirst({
    where: eq(users.id, sessionUser.id),
    with: { credentials: true, oauthAccounts: true },
  });

  if (!fullUser) throw redirect("/login");

  return {
    user: {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      role: fullUser.role,
      avatarUrl: fullUser.avatarUrl,
      createdAt: fullUser.createdAt.toISOString(),
    },
    hasPassword: !!fullUser.credentials,
    hasGoogleOAuth: fullUser.oauthAccounts.some((a) => a.provider === "google"),
  };
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function action({ request }: ActionFunctionArgs) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser) throw redirect("/login");

  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "update-name") {
    const name = ((fd.get("name") as string) ?? "").trim();
    if (!name || name.length < 2) return { intent, error: "Name must be at least 2 characters." };
    if (name.length > 100) return { intent, error: "Name is too long." };

    await db.update(users)
      .set({ name, updatedAt: new Date() })
      .where(eq(users.id, sessionUser.id));

    return { intent, success: "Name updated." };
  }

  if (intent === "change-password") {
    const currentPassword = (fd.get("currentPassword") as string) ?? "";
    const newPassword = (fd.get("newPassword") as string) ?? "";
    const confirmPassword = (fd.get("confirmPassword") as string) ?? "";

    if (!currentPassword || !newPassword || !confirmPassword)
      return { intent, error: "All password fields are required." };
    if (newPassword.length < 8)
      return { intent, error: "New password must be at least 8 characters." };
    if (newPassword !== confirmPassword)
      return { intent, error: "New passwords do not match." };

    const credential = await db.query.userCredentials.findFirst({
      where: eq(userCredentials.userId, sessionUser.id),
    });

    if (!credential) return { intent, error: "No password found for this account." };

    const valid = await bcrypt.compare(currentPassword, credential.passwordHash);
    if (!valid) return { intent, error: "Current password is incorrect." };

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.update(userCredentials)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(userCredentials.userId, sessionUser.id));

    return { intent, success: "Password changed successfully." };
  }

  return { intent, error: "Unknown action." };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derives 1–2 uppercase initials from a display name */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 font-sans outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

// ─── Page ─────────────────────────────────────────────────────────────────────

type ActionData = { intent: string; error?: string; success?: string };

export default function ProfilePage() {
  const { user, hasPassword, hasGoogleOAuth } = useLoaderData<typeof loader>();
  const nameFetcher = useFetcher<ActionData>();
  const passwordFetcher = useFetcher<ActionData>();

  const nameData = nameFetcher.data;
  const pwData = passwordFetcher.data;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 font-sans transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* ── Profile header ─────────────────────────────────────── */}
        <div className="flex items-center gap-5 mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden"
            style={{ backgroundColor: "#202973", fontFamily: "Fredoka, sans-serif" }}
          >
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              : getInitials(user.name)
            }
          </div>
          <div>
            <h1
              className="text-gray-900 leading-none mb-1"
              style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.75rem", fontWeight: 700 }}
            >
              {user.name}
            </h1>
            <p className="text-gray-500 text-sm font-sans">{user.email}</p>
          </div>
        </div>

        {/* ── Account info ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="text-gray-900 font-bold font-sans mb-4">Account info</h2>
          <dl className="flex flex-col gap-3">
            <Row icon={<Mail className="w-4 h-4 text-gray-400" />} label="Email">
              <span className="text-gray-800 font-medium font-sans text-sm">{user.email}</span>
            </Row>
            <Row icon={<Calendar className="w-4 h-4 text-gray-400" />} label="Member since">
              <span className="text-gray-800 font-medium font-sans text-sm">
                {new Date(user.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </Row>
            <Row icon={<Shield className="w-4 h-4 text-gray-400" />} label="Role">
              <span className="text-gray-800 font-medium font-sans text-sm capitalize">{user.role}</span>
            </Row>
            <Row icon={<Lock className="w-4 h-4 text-gray-400" />} label="Sign-in method">
              <div className="flex gap-1.5">
                {hasPassword && <Badge>Email</Badge>}
                {hasGoogleOAuth && <Badge>Google</Badge>}
              </div>
            </Row>
          </dl>
        </div>

        {/* ── Edit name ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="text-gray-900 font-bold font-sans mb-4">Display name</h2>
          <nameFetcher.Form method="post">
            <input type="hidden" name="intent" value="update-name" />
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-sans mb-1.5">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={user.name}
                className={inputCls}
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <Feedback data={nameData} intent="update-name" />
            <SaveButton state={nameFetcher.state} />
          </nameFetcher.Form>
        </div>

        {/* ── Change password (only for password-auth users) ─────── */}
        {hasPassword && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-gray-900 font-bold font-sans mb-4">Change password</h2>
            {/* key resets the form on success */}
            <passwordFetcher.Form
              key={pwData?.intent === "change-password" && pwData.success ? "done" : "idle"}
              method="post"
            >
              <input type="hidden" name="intent" value="change-password" />
              <div className="flex flex-col gap-4 mb-4">
                <PasswordField id="currentPassword" name="currentPassword" label="Current password" autoComplete="current-password" />
                <PasswordField id="newPassword" name="newPassword" label="New password" autoComplete="new-password" minLength={8} />
                <PasswordField id="confirmPassword" name="confirmPassword" label="Confirm new password" autoComplete="new-password" minLength={8} />
              </div>
              <Feedback data={pwData} intent="change-password" />
              <SaveButton state={passwordFetcher.state} label="Update password" loadingLabel="Updating..." />
            </passwordFetcher.Form>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {icon}
      <dt className="text-gray-500 font-sans">{label}</dt>
      <dd className="ml-auto">{children}</dd>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium font-sans">
      {children}
    </span>
  );
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  minLength,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 font-sans mb-1.5">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="password"
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className={inputCls}
      />
    </div>
  );
}

function Feedback({ data, intent }: { data: ActionData | null | undefined; intent: string }) {
  if (!data || data.intent !== intent) return null;
  if (data.error) return <p className="text-sm text-red-600 font-sans mb-3">{data.error}</p>;
  if (data.success) return <p className="text-sm text-green-600 font-sans mb-3">{data.success}</p>;
  return null;
}

function SaveButton({
  state,
  label = "Save changes",
  loadingLabel = "Saving...",
}: {
  state: "idle" | "submitting" | "loading";
  label?: string;
  loadingLabel?: string;
}) {
  return (
    <button
      type="submit"
      disabled={state === "submitting"}
      className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60 font-sans"
      style={{ backgroundColor: "#202973" }}
    >
      {state === "submitting" ? loadingLabel : label}
    </button>
  );
}
