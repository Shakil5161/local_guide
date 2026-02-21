"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";

export const Navbar = () => {
  const { user, logout, loading } = useAuth();

  const commonLinks = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore Tours" },
  ];

  const touristLinks = [
    { href: "/dashboard/tourist", label: "My Bookings" },
    { href: "/profile/me", label: "Profile" },
  ];

  const guideLinks = [
    { href: "/dashboard/guide", label: "Dashboard" },
    { href: "/dashboard/listings", label: "My Listings" },
    { href: "/profile/me", label: "Profile" },
  ];

  const adminLinks = [
    { href: "/dashboard/admin", label: "Admin Dashboard" },
    { href: "/dashboard/admin/users", label: "Manage Users" },
    { href: "/dashboard/admin/listings", label: "Manage Listings" },
  ];

  const roleLinks =
    user?.role === "TOURIST"
      ? touristLinks
      : user?.role === "GUIDE"
      ? guideLinks
      : user?.role === "ADMIN"
      ? adminLinks
      : [];

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-sky-700">
          Local Guide
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          {commonLinks.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-slate-700 hover:text-sky-700">
              {item.label}
            </Link>
          ))}

          {!loading &&
            roleLinks.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-slate-700 hover:text-sky-700">
                {item.label}
              </Link>
            ))}
        </div>

        <div className="flex items-center gap-2">
          {!loading && !user && (
            <>
              <Link href="/login" className="rounded-md px-3 py-1.5 text-sm hover:bg-slate-100">
                Login
              </Link>
              <Link href="/register" className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700">
                Register
              </Link>
            </>
          )}

          {!loading && user && (
            <button
              type="button"
              onClick={logout}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
