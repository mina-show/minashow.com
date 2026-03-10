import { redirect } from "react-router";
import { getSessionUser } from "./session.server";

/**
 * Guards a loader/action to admin-only access.
 * Redirects to /login if unauthenticated, / if authenticated but not admin.
 */
export async function requireAdmin(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    const redirectTo = encodeURIComponent(new URL(request.url).pathname);
    throw redirect(`/login?redirectTo=${redirectTo}`);
  }
  if (user.role !== "admin") throw redirect("/");
  return user;
}
