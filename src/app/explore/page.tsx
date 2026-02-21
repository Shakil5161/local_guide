"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Tour, ToursMeta, TOUR_CATEGORIES, TourCategory } from "@/types/tour";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Clock,
  Users,
  Star,
  SlidersHorizontal,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Filters {
  searchTerm: string;
  city: string;
  category: TourCategory | "";
  minPrice: string;
  maxPrice: string;
}

const EMPTY_FILTERS: Filters = {
  searchTerm: "",
  city: "",
  category: "",
  minPrice: "",
  maxPrice: "",
};

// ─── FilterPanel (defined OUTSIDE page component to avoid remount bug) ────────

interface FilterPanelProps {
  pending: Filters;
  hasActive: boolean;
  onChange: (field: keyof Filters, value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

function FilterPanel({
  pending,
  hasActive,
  onChange,
  onApply,
  onClear,
}: FilterPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          <Search className="mr-1 inline h-4 w-4" />
          Search
        </label>
        <Input
          placeholder="Tour name or destination..."
          value={pending.searchTerm}
          onChange={(e) => onChange("searchTerm", e.target.value)}
          className="h-10"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          <MapPin className="mr-1 inline h-4 w-4" />
          City
        </label>
        <Input
          placeholder="e.g. Paris"
          value={pending.city}
          onChange={(e) => onChange("city", e.target.value)}
          className="h-10"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Category
        </label>
        <select
          value={pending.category}
          onChange={(e) => onChange("category", e.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          {TOUR_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Price Range ($)
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={pending.minPrice}
            onChange={(e) => onChange("minPrice", e.target.value)}
            className="h-10"
            min={0}
          />
          <span className="text-slate-400">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={pending.maxPrice}
            onChange={(e) => onChange("maxPrice", e.target.value)}
            className="h-10"
            min={0}
          />
        </div>
      </div>

      <Button className="h-10 w-full" onClick={onApply}>
        Apply Filters
      </Button>

      {hasActive && (
        <Button
          variant="ghost"
          className="h-9 w-full text-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600"
          onClick={onClear}
        >
          <X className="mr-1.5 h-4 w-4" />
          Clear all filters
        </Button>
      )}
    </div>
  );
}

// ─── FilterChip (also outside) ────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
      {label}
      <button
        onClick={onRemove}
        className="rounded-full text-sky-400 hover:text-sky-700"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// ─── TourCard (also outside) ──────────────────────────────────────────────────

function CategoryBadge({ category }: { category: TourCategory }) {
  const found = TOUR_CATEGORIES.find((c) => c.value === category);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
      {found?.label ?? category}
    </span>
  );
}

function TourCard({ tour }: { tour: Tour }) {
  const fallback = `https://source.unsplash.com/600x400/?travel,${tour.category.toLowerCase()}`;
  const image = tour.images?.[0] || fallback;

  return (
    <Link
      href={`/tours/${tour.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={tour.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <CategoryBadge category={tour.category} />
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-sm font-bold text-sky-700 shadow">
          ${tour.price}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-slate-800 group-hover:text-sky-700">
          {tour.title}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
          {tour.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-sky-500" />
            {tour.city}, {tour.country}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-sky-500" />
            {tour.duration}h
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-sky-500" />
            Max {tour.maxGroupSize}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 overflow-hidden rounded-full bg-sky-100 ring-2 ring-white">
              {tour.guide?.profile?.profilePicture ? (
                <Image
                  src={tour.guide.profile.profilePicture}
                  alt={tour.guide.profile.name}
                  width={28}
                  height={28}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-sky-600">
                  {tour.guide?.profile?.name?.[0] ?? "G"}
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-slate-600">
              {tour.guide?.profile?.name ?? "Local Guide"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-sm text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
            <span className="font-medium">
              {(tour.averageRating ?? 0) > 0
                ? (tour.averageRating ?? 0).toFixed(1)
                : "New"}
            </span>
            {(tour._count?.reviews ?? 0) > 0 && (
              <span className="text-slate-400">({tour._count?.reviews})</span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}

function TourCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="h-48 bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-5/6 rounded bg-slate-100" />
        <div className="flex gap-3 pt-2">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="h-3 w-16 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tours, setTours] = useState<Tour[]>([]);
  const [meta, setMeta] = useState<ToursMeta>({ page: 1, limit: 9, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    searchTerm: searchParams.get("searchTerm") || "",
    city: searchParams.get("city") || "",
    category: (searchParams.get("category") as TourCategory) || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  // pendingFilters: what the user is typing — does NOT trigger a fetch
  const [pendingFilters, setPendingFilters] = useState<Filters>(filters);

  const fetchTours = useCallback(async (f: Filters, pg: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pg, limit: 9 };
      if (f.searchTerm) params.searchTerm = f.searchTerm;
      if (f.city) params.city = f.city;
      if (f.category) params.category = f.category;
      if (f.minPrice) params.minPrice = f.minPrice;
      if (f.maxPrice) params.maxPrice = f.maxPrice;

      const res = await api.get("/tours", { params });
      setTours(res.data?.data ?? []);
      setMeta(res.data?.meta ?? { page: pg, limit: 9, total: 0 });
    } catch {
      toast.error("Failed to load tours. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch when committed filters or page changes
  useEffect(() => {
    fetchTours(filters, page);
  }, [filters, page, fetchTours]);

  // Update a single pending filter field without triggering a fetch
  const handlePendingChange = useCallback(
    (field: keyof Filters, value: string) => {
      setPendingFilters((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const applyFilters = useCallback(() => {
    setFilters(pendingFilters);
    setPage(1);
    setSidebarOpen(false);
    const params = new URLSearchParams();
    Object.entries(pendingFilters).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    router.push(`/explore?${params.toString()}`, { scroll: false });
  }, [pendingFilters, router]);

  const clearFilters = useCallback(() => {
    setPendingFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(1);
    router.push("/explore", { scroll: false });
  }, [router]);

  const removeFilter = useCallback(
    (field: keyof Filters) => {
      const updated = { ...filters, [field]: "" };
      setFilters(updated);
      setPendingFilters(updated);
      setPage(1);
    },
    [filters]
  );

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-sky-700 to-indigo-700 px-4 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold md:text-4xl">Explore Tours</h1>
          <p className="mt-2 text-sky-100">
            {meta.total > 0
              ? `${meta.total} tour${meta.total !== 1 ? "s" : ""} available`
              : "Discover unique local experiences"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </h2>
              <FilterPanel
                pending={pendingFilters}
                hasActive={hasActiveFilters}
                onChange={handlePendingChange}
                onApply={applyFilters}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Mobile filter toggle */}
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen((v) => !v)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="rounded-full bg-sky-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    ON
                  </span>
                )}
              </Button>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              )}
            </div>

            {/* Mobile filter drawer */}
            {sidebarOpen && (
              <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:hidden">
                <FilterPanel
                  pending={pendingFilters}
                  hasActive={hasActiveFilters}
                  onChange={handlePendingChange}
                  onApply={applyFilters}
                  onClear={clearFilters}
                />
              </div>
            )}

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="mb-4 flex flex-wrap gap-2">
                {filters.searchTerm && (
                  <FilterChip
                    label={`"${filters.searchTerm}"`}
                    onRemove={() => removeFilter("searchTerm")}
                  />
                )}
                {filters.city && (
                  <FilterChip
                    label={`📍 ${filters.city}`}
                    onRemove={() => removeFilter("city")}
                  />
                )}
                {filters.category && (
                  <FilterChip
                    label={
                      TOUR_CATEGORIES.find((c) => c.value === filters.category)
                        ?.label ?? filters.category
                    }
                    onRemove={() => removeFilter("category")}
                  />
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <FilterChip
                    label={`$${filters.minPrice || "0"} – $${filters.maxPrice || "∞"}`}
                    onRemove={() => {
                      const updated = {
                        ...filters,
                        minPrice: "",
                        maxPrice: "",
                      };
                      setFilters(updated);
                      setPendingFilters(updated);
                    }}
                  />
                )}
              </div>
            )}

            {/* Tour grid */}
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <TourCardSkeleton key={i} />
                ))}
              </div>
            ) : tours.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
                <span className="mb-3 text-5xl">🗺️</span>
                <h3 className="text-lg font-semibold text-slate-700">
                  No tours found
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Try adjusting your filters or search terms.
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {tours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - page) <= 1
                        )
                        .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                          if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                            acc.push("…");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "…" ? (
                            <span
                              key={`ellipsis-${i}`}
                              className="px-1 text-slate-400"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setPage(p as number)}
                              className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                                page === p
                                  ? "bg-sky-600 text-white"
                                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
