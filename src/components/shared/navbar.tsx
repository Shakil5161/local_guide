"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

// ─── NavLink ──────────────────────────────────────────────────────────────────
// `prefix = true`  → sub-paths also activate the link  (e.g. /explore/*)
// `prefix = false` → exact match only                   (default)
function NavLink({
  href,
  label,
  prefix = false,
}: {
  href: string;
  label: string;
  prefix?: boolean;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (prefix && pathname.startsWith(href + "/"));
  return (
    <Link
      href={href}
      className={cn(
        "relative text-sm font-semibold transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-sky-600 after:transition-transform hover:text-sky-700 hover:after:scale-x-100",
        active ? "text-sky-700 after:scale-x-100" : "text-slate-600"
      )}
    >
      {label}
    </Link>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // prettier-ignore
  const commonLinks = [
    { href: "/explore",  label: "Explore Tours", prefix: true  },
    { href: "/guides",   label: "Find Guides",   prefix: true  },
    { href: "/about",    label: "About",         prefix: false },
    { href: "/contact",  label: "Contact",       prefix: false },
  ];

  // prettier-ignore
  const touristLinks = [
    { href: "/dashboard/tourist",         label: "My Bookings", prefix: false },
    { href: "/dashboard/tourist/reviews", label: "My Reviews",  prefix: false },
    { href: "/dashboard/profile",         label: "Profile",     prefix: false },
  ];

  // prettier-ignore
  const guideLinks = [
    { href: "/dashboard/guide",       label: "Bookings", prefix: false },
    { href: "/dashboard/guide/tours", label: "My Tours", prefix: true  },
    { href: "/dashboard/profile",     label: "Profile",  prefix: false },
  ];

  // prettier-ignore
  const adminLinks = [
    { href: "/dashboard/admin",   label: "Admin Panel", prefix: false },
    { href: "/dashboard/profile", label: "Profile",     prefix: false },
  ];

  const roleLinks =
    user?.role === "TOURIST"
      ? touristLinks
      : user?.role === "GUIDE"
      ? guideLinks
      : user?.role === "ADMIN"
      ? adminLinks
      : [];

  const allLinks = [...commonLinks, ...roleLinks];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <Image
            src="/localguide.png"
            alt="Local Guide"
            width={140}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
          
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {allLinks.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} prefix={l.prefix} />
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-2 md:flex">
          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors hover:bg-slate-50 hover:text-sky-700 hover:ring-sky-400"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
              >
                Register
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100">
                <User className="h-4 w-4 text-sky-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 transition-colors hover:bg-rose-50 hover:ring-rose-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {allLinks.map((l) => (
              <MobileNavLink
                key={l.href}
                href={l.href}
                label={l.label}
                prefix={l.prefix}
                onClick={() => setMobileOpen(false)}
              />
            ))}

            <div className="mt-3 border-t border-slate-100 pt-3">
              {!loading && !user && (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-center text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors hover:bg-slate-50"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md bg-sky-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-sky-700"
                  >
                    Register
                  </Link>
                </div>
              )}

              {!loading && user && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100">
                      <User className="h-4 w-4 text-sky-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// ─── Mobile NavLink (with active highlight) ───────────────────────────────────
function MobileNavLink({
  href,
  label,
  prefix,
  onClick,
}: {
  href: string;
  label: string;
  prefix: boolean;
  onClick: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (prefix && pathname.startsWith(href + "/"));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 hover:text-sky-700",
        active ? "bg-sky-50 text-sky-700" : "text-slate-700"
      )}
    >
      {label}
    </Link>
  );
}
