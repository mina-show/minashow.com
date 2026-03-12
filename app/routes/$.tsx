import { Link, useLocation } from "react-router";
import { ArrowLeft, SearchX } from "lucide-react";

export function meta() {
  return [{ title: "Page not found — Minashow" }];
}

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-5 -mt-8">
          <SearchX className="w-12 h-12 text-gray-900" />
        </div>

        <h1
          className="text-gray-900 mb-3"
        >
          Page not found
        </h1>

        <p className="text-gray-500 font-sans text-sm mb-1">
          We couldn't find{" "}
          <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md text-xs font-mono">
            {pathname}
          </code>
        </p>
        <p className="text-gray-400 font-sans text-sm mb-8">
          It may have moved, been removed, or never existed.
        </p>

        <button
          onClick={() => window.history.back()}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back home
        </button>
      </div>
    </div>
  );
}
