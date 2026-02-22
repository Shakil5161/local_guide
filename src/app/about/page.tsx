import Link from "next/link";
import { Metadata } from "next";
import {
  Shield,
  Heart,
  Globe,
  Users,
  Star,
  Zap,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Local Guide — the platform connecting travelers with passionate local guides for authentic travel experiences.",
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const VALUES = [
  {
    icon: Heart,
    title: "Authentic Experiences",
    desc: "We believe the best travel memories are made with locals, not at tourist traps. Every guide on our platform is a genuine local passionate about sharing their city.",
    color: "bg-rose-50 text-rose-500 ring-rose-100",
  },
  {
    icon: Shield,
    title: "Safety & Trust",
    desc: "All guide profiles are manually reviewed. Verified badges, transparent reviews, and secure Stripe payments give you complete peace of mind.",
    color: "bg-sky-50 text-sky-600 ring-sky-100",
  },
  {
    icon: Globe,
    title: "Global Community",
    desc: "From the tea gardens of Sylhet to the beaches of Cox's Bazar, our guides cover destinations across the world — with more being added every day.",
    color: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  {
    icon: Zap,
    title: "Seamless Booking",
    desc: "Find a tour, request a booking, and pay securely — all in minutes. No back-and-forth emails, no hidden fees, no surprises.",
    color: "bg-amber-50 text-amber-500 ring-amber-100",
  },
];

const TEAM = [
  {
    name: "Arif Rahman",
    role: "Founder & CEO",
    bio: "Passionate traveler who built Local Guide after struggling to find authentic experiences in his own hometown.",
    avatar: "https://ui-avatars.com/api/?name=Arif+Rahman&background=0ea5e9&color=fff&size=200",
  },
  {
    name: "Sadia Islam",
    role: "Head of Guide Relations",
    bio: "Former tour guide herself, Sadia ensures every guide on the platform meets our quality and authenticity standards.",
    avatar: "https://ui-avatars.com/api/?name=Sadia+Islam&background=6366f1&color=fff&size=200",
  },
  {
    name: "Tanvir Hossain",
    role: "Lead Engineer",
    bio: "Builds the technology that makes Local Guide fast, secure, and easy to use for both guides and travelers.",
    avatar: "https://ui-avatars.com/api/?name=Tanvir+Hossain&background=10b981&color=fff&size=200",
  },
  {
    name: "Nadia Chowdhury",
    role: "Community Manager",
    bio: "Manages our growing community of guides and travelers, ensuring everyone has an amazing experience on the platform.",
    avatar: "https://ui-avatars.com/api/?name=Nadia+Chowdhury&background=f59e0b&color=fff&size=200",
  },
];

const STATS = [
  { value: "200+", label: "Verified Guides", icon: "🗺️" },
  { value: "5,000+", label: "Happy Travelers", icon: "😊" },
  { value: "30+", label: "Cities Covered", icon: "🌏" },
  { value: "4.9★", label: "Average Rating", icon: "⭐" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-900 via-sky-900 to-indigo-900 px-4 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
            Our Story
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
            We believe travel should be{" "}
            <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              personal
            </span>
          </h1>
          <p className="mt-5 text-lg text-slate-300 leading-relaxed">
            Local Guide was born out of a simple frustration: why is it so hard
            to experience a city the way locals do? We set out to fix that by
            building a platform where travelers and local guides can connect
            directly — no middlemen, no generic tours.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-sky-600 py-12 text-white">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-3xl">{s.icon}</p>
                <p className="mt-1 text-3xl font-black">{s.value}</p>
                <p className="mt-1 text-sm text-sky-100">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
              Our Mission
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              Connecting people through the magic of local knowledge
            </h2>
            <p className="mt-4 text-slate-500 leading-relaxed">
              Every city, town, and village has stories that only the locals
              know. A street food vendor who&apos;s been cooking the same recipe
              for 30 years. A rooftop with a view that no tour bus ever visits.
              A neighbourhood market that opens only on Tuesdays.
            </p>
            <p className="mt-3 text-slate-500 leading-relaxed">
              Local Guide exists to make those stories discoverable — and to
              give the passionate guides who know them a platform to earn a
              living doing what they love.
            </p>
            <Link
              href="/explore"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-sky-700"
            >
              Start Exploring <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Decorative card */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: "🍜", label: "Food Tours" },
              { emoji: "📸", label: "Photography Walks" },
              { emoji: "🏛️", label: "History Routes" },
              { emoji: "🌿", label: "Nature Trails" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center shadow-sm"
              >
                <span className="text-4xl">{item.emoji}</span>
                <p className="mt-2 font-semibold text-slate-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
              What We Stand For
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              Our Core Values
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="flex gap-4 rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className={`mt-0.5 shrink-0 rounded-xl p-2.5 ring-1 ${v.color}`}>
                  <v.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{v.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
            The People Behind It
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            Meet Our Team
          </h2>
          <p className="mt-3 text-slate-500">
            A small team of travel-lovers, engineers, and community builders.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={member.avatar}
                alt={member.name}
                className="h-20 w-20 rounded-full object-cover shadow-md"
              />
              <h3 className="mt-4 font-bold text-slate-800">{member.name}</h3>
              <p className="mt-0.5 text-xs font-semibold text-sky-600">
                {member.role}
              </p>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── For Guides CTA ── */}
      <section className="bg-gradient-to-r from-sky-600 to-indigo-600 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Users className="mx-auto h-10 w-10 text-sky-200" />
          <h2 className="mt-4 text-3xl font-bold">Are you a local guide?</h2>
          <p className="mt-3 text-sky-100 leading-relaxed">
            Join hundreds of guides who are earning money doing what they love.
            Create your profile, list your tours, and start welcoming travelers
            from around the world.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-white px-6 py-3 font-bold text-sky-700 shadow-lg transition hover:bg-sky-50"
            >
              Become a Guide
            </Link>
            <Link
              href="/guides"
              className="rounded-xl bg-white/10 px-6 py-3 font-semibold ring-1 ring-white/20 transition hover:bg-white/20"
            >
              Browse Guides
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact nudge ── */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-xl px-4 text-center">
          <p className="text-slate-500">
            Have questions or want to partner with us?{" "}
            <Link href="/contact" className="font-semibold text-sky-600 hover:underline">
              Get in touch →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
