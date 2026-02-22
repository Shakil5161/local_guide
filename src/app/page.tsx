"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { useLanguage } from "@/providers/language-provider";
import {
  MapPin,
  Star,
  Users,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Compass,
  Clock,
  ArrowRight,
  CheckCircle2,
  Search,
  TrendingUp,
  Briefcase,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeaturedTour {
  id: string;
  title: string;
  city: string;
  country: string;
  price: number;
  duration: number;
  category: string;
  images: string[];
  reviews: { rating: number }[];
  guide: { profile: { name: string } | null } | null;
}

interface FeaturedGuide {
  id: string;
  name: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  profilePicture: string | null;
  languages: string[];
  expertise: string[];
  yearsOfExperience: number | null;
  isVerified: boolean;
  user: {
    id: string;
    _count: { toursAsGuide: number };
  };
}

// ─── Section 1 – Hero ────────────────────────────────────────────────────────

function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-indigo-900 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=60')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900/80" />

      <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-4 py-1.5 text-sm font-medium text-sky-300 ring-1 ring-sky-500/40">
            <Compass className="h-4 w-4" />
            {t.home.heroTitle}
          </div>

          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Find Trusted{" "}
            <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Local Guides
            </span>{" "}
            for Real Travel Experiences
          </h1>

          <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-2xl">
            {t.home.heroSubtitle}
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-sky-400 hover:shadow-sky-400/30"
            >
              <Search className="h-4 w-4" />
              {t.home.exploreBtn}
            </Link>
            <Link
              href="/guides"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 font-semibold text-white ring-1 ring-white/20 transition-all hover:bg-white/20"
            >
              {t.nav.findGuides}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Social proof mini-stats */}
          <div className="mt-12 flex flex-wrap gap-6">
            {[
              { label: "Verified Guides", value: "200+" },
              { label: "Happy Travelers", value: "5,000+" },
              { label: "Cities Covered", value: "30+" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 2 – Popular Cities (dynamic) ────────────────────────────────────

// Gradient palette — cycles for however many cities exist
const CITY_GRADIENTS = [
  "from-sky-600 to-indigo-700",
  "from-emerald-500 to-teal-700",
  "from-violet-600 to-purple-800",
  "from-amber-500 to-orange-700",
  "from-rose-500 to-pink-700",
  "from-cyan-500 to-sky-700",
  "from-lime-500 to-green-700",
  "from-fuchsia-500 to-violet-700",
];

// City landmark emoji (fallback when no image is available)
const CITY_EMOJIS: Record<string, string> = {
  dhaka: "🕌",
  sylhet: "🍵",
  chattogram: "⚓",
  "cox's bazar": "🏖️",
  rajshahi: "🍊",
  khulna: "🌿",
  paris: "🗼",
  london: "🎡",
  tokyo: "🏯",
  istanbul: "🕌",
  rome: "🏛️",
  bangkok: "⛩️",
  dubai: "🌇",
  barcelona: "🎨",
  amsterdam: "🚲",
  cairo: "🏺",
  default: "🗺️",
};

function cityEmoji(name: string) {
  return CITY_EMOJIS[name.toLowerCase()] ?? CITY_EMOJIS.default;
}

interface CityData {
  name: string;
  count: number;
}

function PopularCitiesSection() {
  const { t } = useLanguage();
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all active tours and aggregate by city
    api
      .get("/tours?limit=200&page=1")
      .then((res) => {
        const tours: { city?: string }[] = res.data?.data ?? [];
        // Count tours per city
        const map: Record<string, number> = {};
        tours.forEach((t) => {
          if (t.city) {
            const key = t.city.trim();
            map[key] = (map[key] ?? 0) + 1;
          }
        });
        // Sort by tour count descending, take top 8
        const sorted = Object.entries(map)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);
        setCities(sorted);
      })
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
            Destinations
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-800 md:text-4xl">
            {t.home.popularCities}
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            {t.home.popularCitiesDesc}
          </p>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && cities.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-14 text-center text-slate-400">
            No cities yet.{" "}
            <Link href="/register" className="text-sky-600 hover:underline">
              Create a tour
            </Link>{" "}
            to appear here!
          </div>
        )}

        {/* City cards */}
        {!loading && cities.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cities.map((city, idx) => {
              const gradient = CITY_GRADIENTS[idx % CITY_GRADIENTS.length];
              return (
                <Link
                  key={city.name}
                  href={`/explore?city=${encodeURIComponent(city.name)}`}
                >
                  <div
                    className={`group relative flex h-48 flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl`}
                  >
                    {/* Decorative circles */}
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />
                    <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />

                    {/* Content */}
                    <span className="relative text-4xl drop-shadow">
                      {cityEmoji(city.name)}
                    </span>
                    <h3 className="relative mt-3 text-xl font-bold drop-shadow">
                      {city.name}
                    </h3>
                    <p className="relative mt-1 flex items-center gap-1 text-sm text-white/80">
                      <MapPin className="h-3.5 w-3.5" />
                      {city.count} tour{city.count !== 1 ? "s" : ""} available
                    </p>

                    {/* Hover arrow */}
                    <div className="relative mt-3 flex items-center gap-1 text-xs font-semibold text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                      Explore <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Section 3 – How It Works ────────────────────────────────────────────────

const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Browse Tours & Guides",
    desc: "Explore hundreds of local tours by city, category, or guide — all with real traveler reviews.",
    color: "bg-sky-50 text-sky-600 ring-sky-100",
  },
  {
    step: "02",
    icon: MessageSquare,
    title: "Request a Booking",
    desc: "Pick your date, group size, and any special requests. Send the booking to your chosen guide.",
    color: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  },
  {
    step: "03",
    icon: CreditCard,
    title: "Pay Securely Online",
    desc: "Once your guide confirms, pay safely via Stripe. Your adventure is locked in!",
    color: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
];

function HowItWorksSection() {
  const { t } = useLanguage();
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
            Simple Process
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-800 md:text-4xl">
            {t.home.howItWorks}
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            {t.home.howItWorksDesc}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, idx) => (
            <div key={s.step} className="relative rounded-2xl bg-white p-7 shadow-sm">
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="absolute -right-3 top-1/3 hidden h-0.5 w-6 bg-slate-200 md:block" />
              )}
              <div className={`mb-5 inline-flex rounded-2xl p-3 ring-1 ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <span className="text-4xl font-black text-slate-100 absolute top-5 right-6 select-none">
                {s.step}
              </span>
              <h3 className="text-lg font-bold text-slate-800">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 4 – Featured Tours ──────────────────────────────────────────────

function FeaturedTourCard({ tour }: { tour: FeaturedTour }) {
  const avgRating =
    tour.reviews?.length > 0
      ? tour.reviews.reduce((s, r) => s + r.rating, 0) / tour.reviews.length
      : null;

  const thumb =
    tour.images?.[0] ||
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&q=70";

  return (
    <Link href={`/tours/${tour.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={thumb}
            alt={tour.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-sky-600/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {tour.category}
            </span>
          </div>
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-sm font-bold text-slate-800 shadow">
              ${tour.price}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-slate-800 group-hover:text-sky-700 transition-colors line-clamp-1">
            {tour.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3" />
            {tour.city}, {tour.country}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {tour.duration}h
            </span>
            {avgRating !== null && (
              <span className="flex items-center gap-1 font-semibold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                {avgRating.toFixed(1)}
              </span>
            )}
            {tour.guide?.profile?.name && (
              <span className="truncate text-slate-400">
                by {tour.guide.profile.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeaturedTourSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-48 animate-pulse bg-slate-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

function FeaturedToursSection() {
  const { t } = useLanguage();
  const [tours, setTours] = useState<FeaturedTour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/tours?limit=4&page=1")
      .then((res) => setTours(res.data?.data ?? []))
      .catch(() => setTours([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
              Handpicked
            </p>
            <h2 className="mt-1 text-3xl font-bold text-slate-800 md:text-4xl">
              {t.home.featuredTours}
            </h2>
            <p className="mt-2 text-slate-500">
              {t.home.featuredToursDesc}
            </p>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t.common.viewAll} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <FeaturedTourSkeleton key={i} />)}
          </div>
        ) : tours.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-400">
            No tours available yet.{" "}
            <Link href="/register" className="text-sky-600 hover:underline">
              Become a guide
            </Link>{" "}
            and list your first tour!
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tours.map((t) => (
              <FeaturedTourCard key={t.id} tour={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Translated sub-component (needs hook) ────────────────────────────────────
function ViewProfileButton() {
  const { t } = useLanguage();
  return (
    <span className="mt-4 w-full rounded-xl bg-sky-50 py-2 text-sm font-semibold text-sky-700 transition-colors group-hover:bg-sky-100">
      {t.common.viewProfile}
    </span>
  );
}

// ─── Section 5 – Featured Guides ─────────────────────────────────────────────

function FeaturedGuideCard({ guide }: { guide: FeaturedGuide }) {
  const avatar =
    guide.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name)}&background=0ea5e9&color=fff&size=200`;

  return (
    <Link href={`/guides/${guide.user.id}`}>
      <div className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl">
        <div className="relative mb-4">
          <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-sky-50 shadow-md">
            <Image
              src={avatar}
              alt={guide.name}
              width={80}
              height={80}
              className="object-cover"
              unoptimized
            />
          </div>
          {guide.isVerified && (
            <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-0.5 shadow">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        <h3 className="font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
          {guide.name}
        </h3>
        {(guide.city || guide.country) && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3" />
            {[guide.city, guide.country].filter(Boolean).join(", ")}
          </p>
        )}

        {guide.bio && (
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {guide.bio}
          </p>
        )}

        <div className="mt-4 flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 text-sky-500" />
            {guide.user._count.toursAsGuide} tours
          </span>
          {guide.yearsOfExperience != null && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              {guide.yearsOfExperience}yr exp
            </span>
          )}
        </div>

        {guide.languages.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1">
            {guide.languages.slice(0, 3).map((l) => (
              <span
                key={l}
                className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-100"
              >
                {l}
              </span>
            ))}
          </div>
        )}

        <ViewProfileButton />
      </div>
    </Link>
  );
}

function FeaturedGuideSkeleton() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6">
      <div className="h-20 w-20 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-4 h-4 w-28 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-9 w-full animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}

function FeaturedGuidesSection() {
  const { t } = useLanguage();
  const [guides, setGuides] = useState<FeaturedGuide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users/guides?limit=4&page=1")
      .then((res) => setGuides(res.data?.data ?? []))
      .catch(() => setGuides([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
              Meet the locals
            </p>
            <h2 className="mt-1 text-3xl font-bold text-slate-800 md:text-4xl">
              Top Local Guides
            </h2>
            <p className="mt-2 text-slate-500">
              Experienced locals ready to show you the real side of their city.
            </p>
          </div>
          <Link
            href="/guides"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t.common.viewAll} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <FeaturedGuideSkeleton key={i} />)}
          </div>
        ) : guides.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center text-slate-400">
            No guides yet.{" "}
            <Link href="/register" className="text-sky-600 hover:underline">
              Join as a guide
            </Link>{" "}
            to be featured here!
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {guides.map((g) => (
              <FeaturedGuideCard key={g.id} guide={g} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Section 6 – Why Choose Us ───────────────────────────────────────────────

const WHY_US = [
  {
    icon: ShieldCheck,
    title: "Verified Guide Profiles",
    desc: "Every guide is manually reviewed. Verified badges ensure you're booking with a trusted local.",
    color: "bg-sky-50 text-sky-600 ring-sky-100",
  },
  {
    icon: Star,
    title: "Real Traveler Reviews",
    desc: "Honest ratings from tourists who completed tours — no fake reviews, ever.",
    color: "bg-amber-50 text-amber-500 ring-amber-100",
  },
  {
    icon: CreditCard,
    title: "Secure Stripe Payments",
    desc: "Your payment is only released after your guide confirms. Powered by Stripe for maximum security.",
    color: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  {
    icon: Users,
    title: "Flexible Group Sizes",
    desc: "Solo traveler or group of friends — every tour lists its max group size so you know what to expect.",
    color: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    desc: "Special requests? Add a note when booking and your guide will personalise the experience just for you.",
    color: "bg-rose-50 text-rose-500 ring-rose-100",
  },
  {
    icon: TrendingUp,
    title: "Diverse Experiences",
    desc: "Food tours, history walks, photography routes, nightlife — there is a tour for every type of traveler.",
    color: "bg-violet-50 text-violet-600 ring-violet-100",
  },
];

function WhyChooseUsSection() {
  const { t } = useLanguage();
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
            Why Local Guide
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-800 md:text-4xl">
            {t.home.whyChooseUs}
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            We built Local Guide to make authentic travel easy, safe, and memorable.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_US.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`mt-0.5 shrink-0 rounded-xl p-2.5 ring-1 ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 7 – Stats Banner ─────────────────────────────────────────────────

function StatsSection() {
  return (
    <section className="bg-gradient-to-r from-sky-600 to-indigo-600 py-14 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Local Guides", value: "200+", icon: "🗺️" },
            { label: "Tours Available", value: "500+", icon: "🎒" },
            { label: "Happy Travelers", value: "5,000+", icon: "😊" },
            { label: "Cities Covered", value: "30+", icon: "🌏" },
          ].map((s) => (
            <div key={s.label}>
              <p className="mb-1 text-3xl">{s.icon}</p>
              <p className="text-3xl font-black">{s.value}</p>
              <p className="mt-1 text-sky-100">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 8 – CTA ─────────────────────────────────────────────────────────

function CtaSection() {
  const { t } = useLanguage();
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-sky-900 p-12 text-white shadow-2xl">
          <span className="text-5xl">🌍</span>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            {t.home.becomeGuide}
          </h2>
          <p className="mt-4 text-sky-200 leading-relaxed">
            {t.home.becomeGuideDesc}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/explore"
              className="flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
            >
              <Search className="h-4 w-4" />
              {t.home.exploreBtn}
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-semibold ring-1 ring-white/20 transition hover:bg-white/20"
            >
              {t.home.becomeGuideBtn}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Trust items */}
          <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-sky-200">
            {["Free to browse", "No hidden fees", "Instant booking"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-sky-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <PopularCitiesSection />
      <HowItWorksSection />
      <FeaturedToursSection />
      <FeaturedGuidesSection />
      <WhyChooseUsSection />
      <StatsSection />
      <CtaSection />
    </main>
  );
}
