import { redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { deleteSession, clearSessionCookie } from "~/lib/auth/session.server";

/** Action-only route — deletes the DB session and clears the cookie. */
export async function action({ request }: ActionFunctionArgs) {
  await deleteSession(request);
  return redirect("/", { headers: { "Set-Cookie": clearSessionCookie() } });
}
