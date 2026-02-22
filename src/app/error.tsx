"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-slate-50 px-4 text-center">
      {/* Icon */}
      <div className="mb-6 rounded-full bg-rose-50 p-10 ring-8 ring-rose-100">
        <span className="text-6xl">⚠️</span>
      </div>

      <h1 className="text-3xl font-bold text-slate-800 md:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-slate-500 leading-relaxed">
        An unexpected error occurred. Don&apos;t worry — your data is safe.
        Please try again or go back to the homepage.
      </p>

      {/* Error digest for debugging */}
      {error?.digest && (
        <p className="mt-2 rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-400">
          Error ID: {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
        >
          🔄 Try Again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          🏠 Go Home
        </Link>
      </div>
    </div>
  );
}
