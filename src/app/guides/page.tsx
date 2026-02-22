"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import {
  Search,
  MapPin,
  Languages,
  Briefcase,
  Star,
  ChevronLeft,
  ChevronRight,
  Users,
  SlidersHorizontal,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/shared/page-loader";
import {
  computeBadges,
  GuideBadgeList,
} from "@/components/shared/guide-badges";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Guide {
  id: string;
  name: string;
  profilePicture: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  languages: string[];
  expertise: string[];
  dailyRate: number | null;
  yearsOfExperience: number | null;
  isVerified: boolean;
  createdAt?: string | null;
  user: {
    id: string;
    email: string;
    createdAt?: string | null;
    _count: { toursAsGuide: number };
  };
}

// ─── Guide Card ───────────────────────────────────────────────────────────────

function GuideCard({ guide }: { guide: Guide }) {
  const avatar =
    guide.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name)}&background=0ea5e9&color=fff&size=200`;

  const badges = computeBadges({
    isVerified: guide.isVerified,
    yearsOfExperience: guide.yearsOfExperience,
    tourCount: guide.user._count.toursAsGuide,
    avgRating: null,
    reviewCount: 0,
    expertise: guide.expertise,
    languages: guide.languages,
    createdAt: guide.user.createdAt ?? guide.createdAt,
  });

  return (
    <Link href={`/guides/${guide.user.id}`}>
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
        {/* Top banner + avatar */}
        <div className="relative h-20 bg-gradient-to-r from-sky-400 to-indigo-500">
          <div className="absolute -bottom-8 left-5">
            <div className="relative h-16 w-16 overflow-hidden rounded-full ring-4 ring-white shadow-md">
              <Image
                src={avatar}
                alt={guide.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
          {guide.isVerified && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-emerald-600 shadow">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </div>
          )}
        </div>

        <div className="pt-10 px-5 pb-5 flex flex-col flex-1">
          {/* Name + location */}
          <div>
            <h3 className="font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
              {guide.name}
            </h3>
            {(guide.city || guide.country) && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3" />
                {[guide.city, guide.country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {/* Bio */}
          {guide.bio && (
            <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {guide.bio}
            </p>
          )}

          {/* Stats row */}
          <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-sky-500" />
              {guide.user._count.toursAsGuide} tour
              {guide.user._count.toursAsGuide !== 1 ? "s" : ""}
            </span>
            {guide.yearsOfExperience != null && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400" />
                {guide.yearsOfExperience} yr{guide.yearsOfExperience !== 1 ? "s" : ""} exp
              </span>
            )}
            {guide.dailyRate != null && (
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                ${guide.dailyRate}/day
              </span>
            )}
          </div>

          {/* Languages */}
          {guide.languages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {guide.languages.slice(0, 3).map((lang) => (
                <span
                  key={lang}
                  className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-100"
                >
                  {lang}
                </span>
              ))}
              {guide.languages.length > 3 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                  +{guide.languages.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Expertise tags */}
          {guide.expertise.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {guide.expertise.slice(0, 3).map((exp) => (
                <span
                  key={exp}
                  className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600 ring-1 ring-indigo-100"
                >
                  {exp}
                </span>
              ))}
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="mt-3">
              <GuideBadgeList badges={badges} max={2} size="xs" />
            </div>
          )}

          {/* CTA */}
          <div className="mt-4">
            <span className="inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-sky-700">
              View Profile
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GuideCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-20 animate-pulse bg-slate-200" />
      <div className="px-5 pb-5 pt-10 space-y-3">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="h-9 w-full animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GuidesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Committed filters (from URL)
  const pageParam = Number(searchParams.get("page") ?? 1);
  const cityParam = searchParams.get("city") ?? "";
  const languageParam = searchParams.get("language") ?? "";
  const expertiseParam = searchParams.get("expertise") ?? "";

  // Draft filters (in local state)
  const [draftCity, setDraftCity] = useState(cityParam);
  const [draftLanguage, setDraftLanguage] = useState(languageParam);
  const [draftExpertise, setDraftExpertise] = useState(expertiseParam);
  const [showFilters, setShowFilters] = useState(false);

  // Data
  const [guides, setGuides] = useState<Guide[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pageParam));
      params.set("limit", String(limit));
      if (cityParam) params.set("city", cityParam);
      if (languageParam) params.set("language", languageParam);
      if (expertiseParam) params.set("expertise", expertiseParam);

      const res = await api.get(`/users/guides?${params.toString()}`);
      setGuides(res.data?.data ?? []);
      setTotal(res.data?.meta?.total ?? 0);
    } catch {
      setGuides([]);
    } finally {
      setLoading(false);
    }
  }, [pageParam, cityParam, languageParam, expertiseParam]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  // Sync draft when URL changes (e.g. browser back)
  useEffect(() => {
    setDraftCity(cityParam);
    setDraftLanguage(languageParam);
    setDraftExpertise(expertiseParam);
  }, [cityParam, languageParam, expertiseParam]);

  const applyFilters = () => {
    const p = new URLSearchParams();
    p.set("page", "1");
    if (draftCity.trim()) p.set("city", draftCity.trim());
    if (draftLanguage.trim()) p.set("language", draftLanguage.trim());
    if (draftExpertise.trim()) p.set("expertise", draftExpertise.trim());
    router.push(`/guides?${p.toString()}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setDraftCity("");
    setDraftLanguage("");
    setDraftExpertise("");
    router.push("/guides");
    setShowFilters(false);
  };

  const hasFilters = !!(cityParam || languageParam || expertiseParam);

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/guides?${params.toString()}`);
  };

  const fieldCls =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-sky-700 via-sky-600 to-indigo-700 px-4 py-14 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-white/20 p-3">
              <Users className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">Find Your Perfect Local Guide</h1>
          <p className="mt-3 text-sky-100 text-lg">
            Connect with experienced locals who know their city inside out
          </p>

          {/* Quick search bar */}
          <div className="mx-auto mt-8 flex max-w-lg gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border-0 bg-white pl-9 pr-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Search by city…"
                value={draftCity}
                onChange={(e) => setDraftCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
            <Button
              onClick={applyFilters}
              className="gap-2 px-5 py-3 bg-white text-sky-700 hover:bg-sky-50 shadow-md font-semibold"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* ── Filter bar ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-500">
              {loading ? "Loading…" : `${total} guide${total !== 1 ? "s" : ""} found`}
            </p>
            {/* Active filter chips */}
            {cityParam && (
              <span className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                <MapPin className="h-3 w-3" /> {cityParam}
                <button onClick={() => { setDraftCity(""); router.push(`/guides?page=1${languageParam ? `&language=${languageParam}` : ""}${expertiseParam ? `&expertise=${expertiseParam}` : ""}`); }}>
                  <X className="h-3 w-3 ml-0.5" />
                </button>
              </span>
            )}
            {languageParam && (
              <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                <Languages className="h-3 w-3" /> {languageParam}
                <button onClick={() => router.push(`/guides?page=1${cityParam ? `&city=${cityParam}` : ""}${expertiseParam ? `&expertise=${expertiseParam}` : ""}`)}>
                  <X className="h-3 w-3 ml-0.5" />
                </button>
              </span>
            )}
            {expertiseParam && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                <Briefcase className="h-3 w-3" /> {expertiseParam}
                <button onClick={() => router.push(`/guides?page=1${cityParam ? `&city=${cityParam}` : ""}${languageParam ? `&language=${languageParam}` : ""}`)}>
                  <X className="h-3 w-3 ml-0.5" />
                </button>
              </span>
            )}
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-rose-500 hover:underline">
                Clear all
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            More Filters
          </Button>
        </div>

        {/* ── Expanded filter panel ── */}
        {showFilters && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-slate-700">Filter Guides</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <MapPin className="h-3 w-3" /> City
                </label>
                <input
                  className={fieldCls}
                  placeholder="e.g. Paris"
                  value={draftCity}
                  onChange={(e) => setDraftCity(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <Languages className="h-3 w-3" /> Language
                </label>
                <input
                  className={fieldCls}
                  placeholder="e.g. French"
                  value={draftLanguage}
                  onChange={(e) => setDraftLanguage(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <Briefcase className="h-3 w-3" /> Expertise
                </label>
                <input
                  className={fieldCls}
                  placeholder="e.g. History"
                  value={draftExpertise}
                  onChange={(e) => setDraftExpertise(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear
              </Button>
              <Button size="sm" onClick={applyFilters} className="gap-1.5">
                <Search className="h-3.5 w-3.5" />
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* ── Guides grid ── */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <GuideCardSkeleton key={i} />
            ))}
          </div>
        ) : guides.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
            <span className="mb-3 text-5xl">🔍</span>
            <h3 className="text-lg font-semibold text-slate-700">No guides found</h3>
            <p className="mt-1 text-sm text-slate-400">
              Try adjusting your search filters
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-5">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {guides.map((g) => (
              <GuideCard key={g.id} guide={g} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              disabled={pageParam <= 1}
              onClick={() => goToPage(pageParam - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                  p === pageParam
                    ? "bg-sky-600 text-white shadow"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={pageParam >= totalPages}
              onClick={() => goToPage(pageParam + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
