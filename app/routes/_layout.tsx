import { Outlet, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Providers } from "~/components/providers";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { MiniPlayer } from "~/components/layout/mini-player";
import { getSessionUser } from "~/lib/auth/session.server";
import type { SessionUser } from "~/lib/auth/types";

export async function loader({ request }: LoaderFunctionArgs) {
  const dbUser = await getSessionUser(request);
  const user: SessionUser | null = dbUser
    ? { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role, avatarUrl: dbUser.avatarUrl }
    : null;
  return { user };
}

export default function Layout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <Providers user={user}>
      <LayoutInner />
    </Providers>
  );
}

function LayoutInner() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      {/* pt-16 offsets the fixed header; pb-20 clears the MiniPlayer when active */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <MiniPlayer />
    </div>
  );
}
