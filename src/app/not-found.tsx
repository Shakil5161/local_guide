import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-slate-50 px-4 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="rounded-full bg-sky-50 p-10 ring-8 ring-sky-100">
          <span className="text-7xl">🗺️</span>
        </div>
        <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-lg font-black text-white shadow-lg">
          ?
        </div>
      </div>

      {/* Text */}
      <h1 className="text-8xl font-black text-slate-200">404</h1>
      <h2 className="-mt-4 text-2xl font-bold text-slate-800 md:text-3xl">
        Page not found
      </h2>
      <p className="mt-3 max-w-md text-slate-500 leading-relaxed">
        Looks like this path leads nowhere. The page you&apos;re looking for
        doesn&apos;t exist or may have been moved.
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
        >
          🏠 Go Home
        </Link>
        <Link
          href="/explore"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          🔍 Explore Tours
        </Link>
      </div>

      {/* Quick links */}
      <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
        <Link href="/guides" className="hover:text-sky-600 hover:underline">
          Find Guides
        </Link>
        <Link href="/login" className="hover:text-sky-600 hover:underline">
          Login
        </Link>
        <Link href="/register" className="hover:text-sky-600 hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
}
