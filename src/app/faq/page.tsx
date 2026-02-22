"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "General", "For Tourists", "For Guides", "Payments", "Safety"] as const;
type Category = (typeof CATEGORIES)[number];

interface FAQ {
  q: string;
  a: string;
  category: Exclude<Category, "All">;
}

const FAQS: FAQ[] = [
  // General
  {
    category: "General",
    q: "What is Local Guide?",
    a: "Local Guide is a platform that connects travellers with passionate local guides. You can browse tours, book experiences, pay securely, and leave reviews — all in one place. Guides can create profiles, list tours, and manage bookings.",
  },
  {
    category: "General",
    q: "Is Local Guide available worldwide?",
    a: "We currently focus on destinations across Bangladesh, with cities like Dhaka, Chittagong, Sylhet, and Cox's Bazar. We are expanding rapidly and new cities and countries are added every month.",
  },
  {
    category: "General",
    q: "How do I create an account?",
    a: "Click Register at the top of the page, choose your role (Tourist or Guide), fill in your details, and you're good to go. The whole process takes under two minutes.",
  },
  {
    category: "General",
    q: "Can I switch between Tourist and Guide roles?",
    a: "Not directly. Each account is tied to a single role. If you'd like to join as both a tourist and a guide, simply create two separate accounts with different email addresses.",
  },

  // For Tourists
  {
    category: "For Tourists",
    q: "How do I book a tour?",
    a: "Browse the Explore page, open a tour you like, choose your preferred date, and click Book Now. You'll be taken to a secure Stripe checkout page to complete payment.",
  },
  {
    category: "For Tourists",
    q: "Can I cancel a booking?",
    a: "Yes. From your Tourist Dashboard, find the booking and click Cancel. Cancellations are free if made at least 48 hours before the tour start date. Cancellations made after that may be subject to our refund policy.",
  },
  {
    category: "For Tourists",
    q: "How do I leave a review?",
    a: "After your tour is completed and marked COMPLETED by your guide, go to My Reviews in your dashboard. You can then submit a star rating and written review for that booking.",
  },
  {
    category: "For Tourists",
    q: "What if the guide doesn't confirm my booking?",
    a: "Guides have 24 hours to confirm booking requests. If they don't respond in time, your booking will be automatically cancelled and any payment held will be fully refunded.",
  },

  // For Guides
  {
    category: "For Guides",
    q: "How do I create a tour?",
    a: "Log in as a Guide, go to My Tours in your dashboard, and click Create Tour. Fill in the tour name, description, city, price, duration, and available dates. Your tour will go live immediately.",
  },
  {
    category: "For Guides",
    q: "How do I get paid?",
    a: "When a tourist pays for your tour via Stripe, the funds are processed securely. Payouts are transferred to your linked bank account within 2–5 business days after the tour date.",
  },
  {
    category: "For Guides",
    q: "Can I set my own prices?",
    a: "Absolutely. You have full control over the price of each tour you create. We recommend researching comparable tours in your city to stay competitive.",
  },
  {
    category: "For Guides",
    q: "What happens if a tourist cancels?",
    a: "If the tourist cancels more than 48 hours before the tour, you will not receive payment. If they cancel within 48 hours, you will receive a partial payout as per our policy.",
  },

  // Payments
  {
    category: "Payments",
    q: "What payment methods are accepted?",
    a: "We use Stripe for secure payment processing. You can pay with any major credit or debit card (Visa, Mastercard, Amex). Google Pay and Apple Pay are supported where available.",
  },
  {
    category: "Payments",
    q: "Is my payment information secure?",
    a: "Yes. We never store your card details on our servers. All payment data is handled by Stripe, which is PCI DSS Level 1 certified — the gold standard in payment security.",
  },
  {
    category: "Payments",
    q: "When am I charged for a booking?",
    a: "You are charged immediately when your booking request is accepted by the guide and you complete the Stripe checkout flow.",
  },
  {
    category: "Payments",
    q: "How do I get a refund?",
    a: "If you are eligible for a refund (see our cancellation policy), it will automatically be processed back to your original payment method within 5–10 business days.",
  },

  // Safety
  {
    category: "Safety",
    q: "Are the guides verified?",
    a: "Every guide profile is reviewed by our team before going live. We check identity documents and look at the quality of their tour listings. Guides with verified badges have passed our full verification process.",
  },
  {
    category: "Safety",
    q: "What if I feel unsafe during a tour?",
    a: "Your safety is our top priority. If you ever feel unsafe, leave the situation immediately and contact local emergency services. Then report the incident to us at safety@localguide.com. We take every report seriously.",
  },
  {
    category: "Safety",
    q: "How are reviews kept honest?",
    a: "Only tourists who have completed a paid booking can leave a review for a tour. This prevents fake reviews. Guides cannot delete or edit tourist reviews.",
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function AccordionItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="pr-4 font-semibold text-slate-800">{faq.q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-sky-500 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter((faq) => {
    const matchCat = activeCategory === "All" || faq.category === activeCategory;
    const matchSearch =
      !search ||
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Group by category for display
  const grouped: Partial<Record<Exclude<Category, "All">, FAQ[]>> = {};
  filtered.forEach((faq) => {
    if (!grouped[faq.category]) grouped[faq.category] = [];
    grouped[faq.category]!.push(faq);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-900 via-sky-900 to-indigo-900 px-4 py-16 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
            Help Center
          </p>
          <h1 className="mt-3 text-4xl font-bold">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-slate-300">
            Can&apos;t find your answer? Reach us at{" "}
            <a
              href="mailto:hello@localguide.com"
              className="font-semibold text-sky-400 hover:underline"
            >
              hello@localguide.com
            </a>
          </p>

          {/* Search */}
          <div className="relative mx-auto mt-7 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 pl-10 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
            />
          </div>
        </div>
      </section>

      {/* ── Category tabs ── */}
      <div className="sticky top-16 z-10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 py-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                activeCategory === cat
                  ? "bg-sky-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── FAQ list ── */}
      <div className="mx-auto max-w-3xl px-4 py-10">
        {Object.keys(grouped).length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 font-semibold text-slate-700">
              No results for &quot;{search}&quot;
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different keyword or{" "}
              <Link
                href="/contact"
                className="font-semibold text-sky-600 hover:underline"
              >
                contact us
              </Link>
              .
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, faqs]) => (
            <div key={category} className="mb-8">
              {activeCategory === "All" && (
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-sky-600">
                  {category}
                </h2>
              )}
              <div className="rounded-2xl border border-slate-200 bg-white px-5 shadow-sm">
                {faqs!.map((faq) => (
                  <AccordionItem key={faq.q} faq={faq} />
                ))}
              </div>
            </div>
          ))
        )}

        {/* CTA */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 p-6 text-center text-white shadow-md">
          <p className="font-semibold">Still have questions?</p>
          <p className="mt-1 text-sm text-sky-100">
            Our support team is happy to help.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-sky-700 shadow hover:bg-sky-50"
          >
            Contact Support <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
