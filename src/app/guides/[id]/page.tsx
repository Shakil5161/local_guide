"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { PageLoader } from "@/components/shared/page-loader";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Star,
  Briefcase,
  Languages,
  DollarSign,
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  Mail,
  Clock,
  Tag,
  Heart,
} from "lucide-react";
import Image2 from "next/image";
import {
  computeBadges,
  GuideBadge,
  GuideBadgeList,
} from "@/components/shared/guide-badges";
import { TourMap } from "@/components/shared/tour-map";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GuideProfile {
  id: string;
  email: string;
  role: string;
  createdAt?: string | null;
  profile: {
    name: string;
    bio: string | null;
    profilePicture: string | null;
    city: string | null;
    country: string | null;
    phone: string | null;
    languages: string[];
    expertise: string[];
    travelPreferences: string[];
    dailyRate: number | null;
    yearsOfExperience: number | null;
    isVerified: boolean;
  } | null;
}

interface Tour {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  maxGroupSize: number;
  city: string;
  country: string;
  images: string[];
  _count?: { reviews: number; bookings: number };
  reviews?: { rating: number }[];
}

// ─── Star display ─────────────────────────────────────────────────────────────

function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`h-4 w-4 ${
              n <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-slate-700">
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-xs text-slate-400">({count})</span>
      )}
    </div>
  );
}

// ─── Tour card ────────────────────────────────────────────────────────────────

function TourCard({ tour }: { tour: Tour }) {
  const avgRating =
    tour.reviews && tour.reviews.length > 0
      ? tour.reviews.reduce((s, r) => s + r.rating, 0) / tour.reviews.length
      : null;

  const thumb =
    tour.images?.[0] ||
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=70";

  return (
    <Link href={`/tours/${tour.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
          <Image
            src={thumb}
            alt={tour.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          {/* Category badge */}
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-sky-600/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {tour.category}
            </span>
          </div>
          {/* Price badge */}
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-800 shadow backdrop-blur-sm">
              ${tour.price}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-slate-800 group-hover:text-sky-700 line-clamp-1 transition-colors">
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
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> max {tour.maxGroupSize}
            </span>
            {avgRating !== null && <Stars rating={avgRating} />}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Tour card skeleton ───────────────────────────────────────────────────────

function TourCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-44 animate-pulse bg-slate-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={`flex flex-col items-center rounded-2xl p-4 ${color}`}>
      <Icon className="h-5 w-5 mb-1 opacity-70" />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs opacity-70 mt-0.5">{label}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GuideProfilePage() {
  const params = useParams();
  const guideId = params.id as string;

  const [guide, setGuide] = useState<GuideProfile | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loadingGuide, setLoadingGuide] = useState(true);
  const [loadingTours, setLoadingTours] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchGuide = useCallback(async () => {
    try {
      const res = await api.get(`/users/${guideId}`);
      const data = res.data?.data;
      if (!data || data.role !== "GUIDE") {
        setNotFound(true);
      } else {
        setGuide(data);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoadingGuide(false);
    }
  }, [guideId]);

  const fetchTours = useCallback(async () => {
    try {
      const res = await api.get(`/tours?guideId=${guideId}&limit=20`);
      setTours(res.data?.data?.data ?? []);
    } catch {
      setTours([]);
    } finally {
      setLoadingTours(false);
    }
  }, [guideId]);

  useEffect(() => {
    fetchGuide();
    fetchTours();
  }, [fetchGuide, fetchTours]);

  if (loadingGuide) return <PageLoader message="Loading guide profile…" />;

  if (notFound) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <span className="mb-4 text-6xl">🔍</span>
        <h1 className="text-2xl font-bold text-slate-800">Guide not found</h1>
        <p className="mt-2 text-slate-500">
          This guide profile doesn&apos;t exist or is not active.
        </p>
        <Link href="/guides" className="mt-6">
          <Button>Browse All Guides</Button>
        </Link>
      </div>
    );
  }

  const p = guide!.profile;
  const avatar =
    p?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(p?.name ?? "Guide")}&background=0ea5e9&color=fff&size=300`;

  // Compute avg rating across all tours
  const allReviews = tours.flatMap((t) => t.reviews ?? []);
  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      : null;

  const badges = computeBadges({
    isVerified: p?.isVerified ?? false,
    yearsOfExperience: p?.yearsOfExperience ?? null,
    tourCount: tours.length,
    avgRating,
    reviewCount: allReviews.length,
    expertise: p?.expertise ?? [],
    languages: p?.languages ?? [],
    createdAt: guide!.createdAt,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Banner ── */}
      <div className="bg-gradient-to-br from-sky-700 via-sky-600 to-indigo-700 px-4 pt-8 pb-32 text-white">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-sm text-sky-100 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All Guides
          </Link>
        </div>
      </div>

      {/* ── Profile card ── */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="-mt-24 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {/* Header strip */}
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
            {/* Avatar */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-4 ring-white shadow-lg">
              <Image2
                src={avatar}
                alt={p?.name ?? "Guide"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Name + meta */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-800">
                  {p?.name ?? "Unknown Guide"}
                </h1>
                {p?.isVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Guide
                  </span>
                )}
              </div>
              {(p?.city || p?.country) && (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {[p.city, p.country].filter(Boolean).join(", ")}
                </p>
              )}
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <Mail className="h-3 w-3" />
                {guide!.email}
              </p>
            </div>

            {/* Contact CTA */}
            <div className="shrink-0">
              <Link href="/explore">
                <Button className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Book a Tour
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 px-6 py-5 sm:grid-cols-4">
            <StatPill
              icon={Briefcase}
              label="Tours"
              value={tours.length}
              color="bg-sky-50 text-sky-700"
            />
            {p?.yearsOfExperience != null && (
              <StatPill
                icon={Star}
                label="Yrs Experience"
                value={p.yearsOfExperience}
                color="bg-amber-50 text-amber-700"
              />
            )}
            {p?.dailyRate != null && (
              <StatPill
                icon={DollarSign}
                label="Daily Rate"
                value={`$${p.dailyRate}`}
                color="bg-emerald-50 text-emerald-700"
              />
            )}
            <StatPill
              icon={Languages}
              label="Languages"
              value={p?.languages.length ?? 0}
              color="bg-indigo-50 text-indigo-700"
            />
          </div>

          {/* Bio */}
          {p?.bio && (
            <div className="border-t border-slate-100 px-6 py-5">
              <h2 className="mb-2 font-semibold text-slate-700">About</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{p.bio}</p>
            </div>
          )}

          {/* Tags section */}
          <div className="border-t border-slate-100 px-6 py-5 space-y-4">
            {p?.languages && p.languages.length > 0 && (
              <div>
                <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Languages className="h-4 w-4 text-sky-500" />
                  Languages Spoken
                </h2>
                <div className="flex flex-wrap gap-2">
                  {p.languages.map((lang) => (
                    <span
                      key={lang}
                      className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700 ring-1 ring-sky-100"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {p?.expertise && p.expertise.length > 0 && (
              <div>
                <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Tag className="h-4 w-4 text-indigo-500" />
                  Areas of Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {p.expertise.map((exp) => (
                    <span
                      key={exp}
                      className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-indigo-100"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {p?.travelPreferences && p.travelPreferences.length > 0 && (
              <div>
                <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Heart className="h-4 w-4 text-rose-400" />
                  Travel Preferences
                </h2>
                <div className="flex flex-wrap gap-2">
                  {p.travelPreferences.map((pref) => (
                    <span
                      key={pref}
                      className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-600 ring-1 ring-rose-100"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Badges ── */}
          {badges.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-700">
                🏅 Achievements &amp; Badges
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {badges.map((badge) => (
                  <div
                    key={badge.key}
                    className={`flex items-start gap-3 rounded-xl p-3 ring-1 ${badge.color} ${badge.ring}`}
                  >
                    <span className="text-2xl leading-none">{badge.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{badge.label}</p>
                      <p className="text-xs opacity-80 mt-0.5 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Location Map ── */}
        {p?.city && p?.country && (
          <div className="mt-6">
            <TourMap
              city={p.city}
              country={p.country}
              title={`${p.name ?? "Guide"}'s Location`}
            />
          </div>
        )}

        {/* ── Tours by this guide ── */}
        <div className="mt-10 mb-12">
          <h2 className="mb-5 text-xl font-bold text-slate-800">
            Tours by {p?.name ?? "this guide"}
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({tours.length})
            </span>
          </h2>

          {loadingTours ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <TourCardSkeleton key={i} />
              ))}
            </div>
          ) : tours.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-14 text-center">
              <span className="mb-2 text-4xl">🗺️</span>
              <p className="text-slate-500">
                This guide hasn&apos;t listed any tours yet.
              </p>
              <Link href="/explore" className="mt-4">
                <Button variant="outline" size="sm">
                  Explore Other Tours
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
