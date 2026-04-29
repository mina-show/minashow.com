import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "react-router";

import type { Route } from "./+types/root";
import type { routePaths } from "~/lib/router/routes";
import type { Theme } from "~/lib/preferences/preference-types";
import "./app.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap",
  },
];

/** Reads theme preference from cookie for SSR-safe rendering */
export function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.split("; ").find((row) => row.startsWith("user_preferences="));
  let theme: Theme = "system";
  if (match) {
    try {
      const parsed = JSON.parse(decodeURIComponent(match.split("=")[1]));
      if (parsed?.theme) theme = parsed.theme as Theme;
    } catch {
      // ignore
    }
  }
  return { theme };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const statusText = isRouteErrorResponse(error) ? error.statusText : undefined;
  const devMessage = import.meta.env.DEV && error instanceof Error ? error.message : undefined;
  const devStack = import.meta.env.DEV && error instanceof Error ? error.stack : undefined;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <p
          className="leading-none mb-4 text-gray-900 select-none"
          style={{ fontFamily: "Fredoka, sans-serif", fontSize: "10rem", fontWeight: 700 }}
          aria-hidden="true"
        >
          {is404 ? "404" : "500"}
        </p>

        <h1
          className="text-gray-900 mb-3 -mt-6"
          style={{ fontFamily: "Fredoka, sans-serif", fontSize: "1.75rem", fontWeight: 700 }}
        >
          {is404 ? "Page not found" : "Something went wrong"}
        </h1>

        <p className="text-gray-500 font-sans text-sm mb-8">
          {is404
            ? "The page you're looking for doesn't exist."
            : (statusText ?? devMessage ?? "An unexpected error occurred.")}
        </p>

        {devStack && (
          <pre className="text-left w-full p-4 mb-6 overflow-x-auto bg-gray-100 rounded-xl text-xs font-mono text-gray-600">
            {devStack}
          </pre>
        )}

        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-colors hover:opacity-90 font-sans"
          style={{ backgroundColor: "#202973" }}
        >
          Go home
        </a>
      </div>
    </main>
  );
}
