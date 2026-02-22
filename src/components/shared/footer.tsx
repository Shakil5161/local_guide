import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    Explore: [
      { label: "Browse Tours", href: "/explore" },
      { label: "Find Guides", href: "/guides" },
      { label: "Popular Cities", href: "/explore?city=Dhaka" },
    ],
    Company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
    Account: [
      { label: "Login", href: "/login" },
      { label: "Register", href: "/register" },
      { label: "Become a Guide", href: "/register" },
    ],
    Dashboard: [
      { label: "My Bookings", href: "/dashboard/tourist" },
      { label: "My Reviews", href: "/dashboard/tourist/reviews" },
      { label: "Profile", href: "/dashboard/profile" },
    ],
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-80">
              <Image
                src="/localguide.png"
                alt="Local Guide"
                width={130}
                height={36}
                className="h-9 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Connecting travelers with passionate local guides for authentic,
              unforgettable experiences around the world.
            </p>
            <div className="mt-5 flex gap-3">
              {/* Social icons */}
              {[
                { label: "Facebook", icon: "f", href: "#" },
                { label: "Twitter", icon: "𝕏", href: "#" },
                { label: "Instagram", icon: "◎", href: "#" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-sm text-slate-400 transition hover:bg-sky-600 hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 transition hover:text-sky-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {currentYear} Local Guide. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/faq" className="hover:text-sky-400 transition-colors">
              FAQ
            </Link>
            <Link href="/about" className="hover:text-sky-400 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-sky-400 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
