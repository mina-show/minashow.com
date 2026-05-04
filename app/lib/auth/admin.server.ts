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

/**
 * Guards a customer-only route (cart, checkout, my-orders, order submission).
 * Unauthenticated → /login?redirectTo=<path>. Admin → /admin.
 */
export async function requireCustomer(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    const redirectTo = encodeURIComponent(new URL(request.url).pathname);
    throw redirect(`/login?redirectTo=${redirectTo}`);
  }
  if (user.role === "admin") throw redirect("/admin");
  return user;
}

/**
 * Blocks admins from a route while leaving guests and customers untouched.
 * Used for /cart, where unauthenticated browsing is allowed.
 */
export async function forbidAdmin(request: Request) {
  const user = await getSessionUser(request);
  if (user && user.role === "admin") throw redirect("/admin");
  return user;
}
