"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Tour, TourCategory, TOUR_CATEGORIES } from "@/types/tour";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Star,
  BookOpen,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";

// ─── Tour Form State ──────────────────────────────────────────────────────────

interface TourFormState {
  title: string;
  description: string;
  category: TourCategory | "";
  price: string;
  duration: string;
  maxGroupSize: string;
  city: string;
  country: string;
  meetingPoint: string;
  imagesRaw: string; // comma-separated URLs
  includedRaw: string; // newline-separated
  excludedRaw: string; // newline-separated
  isActive: boolean;
}

const EMPTY_FORM: TourFormState = {
  title: "",
  description: "",
  category: "",
  price: "",
  duration: "",
  maxGroupSize: "",
  city: "",
  country: "",
  meetingPoint: "",
  imagesRaw: "",
  includedRaw: "",
  excludedRaw: "",
  isActive: true,
};

function tourToForm(t: Tour): TourFormState {
  return {
    title: t.title,
    description: t.description,
    category: t.category,
    price: String(t.price),
    duration: String(t.duration),
    maxGroupSize: String(t.maxGroupSize),
    city: t.city,
    country: t.country,
    meetingPoint: t.meetingPoint ?? "",
    imagesRaw: (t.images ?? []).join(", "),
    includedRaw: (t.included ?? []).join("\n"),
    excludedRaw: (t.excluded ?? []).join("\n"),
    isActive: t.isActive,
  };
}

function formToPayload(f: TourFormState) {
  return {
    title: f.title.trim(),
    description: f.description.trim(),
    category: f.category,
    price: Number(f.price),
    duration: Number(f.duration),
    maxGroupSize: Number(f.maxGroupSize),
    city: f.city.trim(),
    country: f.country.trim(),
    meetingPoint: f.meetingPoint.trim(),
    images: f.imagesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    included: f.includedRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    excluded: f.excludedRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    isActive: f.isActive,
  };
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {active ? "Published" : "Unpublished"}
    </span>
  );
}

// ─── Tour Card ────────────────────────────────────────────────────────────────

function TourCard({
  tour,
  onEdit,
  onToggle,
  onDelete,
  actionId,
}: {
  tour: Tour;
  onEdit: (t: Tour) => void;
  onToggle: (t: Tour) => void;
  onDelete: (t: Tour) => void;
  actionId: string | null;
}) {
  const isLoading = actionId === tour.id;
  const fallback = `https://source.unsplash.com/600x400/?${tour.category.toLowerCase()},travel`;
  const image = tour.images?.[0] || fallback;
  const cat = TOUR_CATEGORIES.find((c) => c.value === tour.category);

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
        tour.isActive ? "border-slate-200" : "border-dashed border-slate-300 opacity-70"
      }`}
    >
      {/* Image */}
      <div className="relative h-44 w-full">
        <Image
          src={image}
          alt={tour.title}
          fill
          className="object-cover"
          unoptimized
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Category + status overlays */}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow">
          {cat?.label ?? tour.category}
        </div>
        <div className="absolute right-3 top-3">
          <ActiveBadge active={tour.isActive} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-800">{tour.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{tour.description}</p>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-sky-500" />
            {tour.city}, {tour.country}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
            {tour.price}/person
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            {tour.duration}h
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-amber-500" />
            max {tour.maxGroupSize}
          </span>
        </div>

        {/* Stats */}
        {tour._count && (
          <div className="mt-3 flex gap-4 rounded-xl bg-slate-50 px-3 py-2 text-xs">
            <span className="flex items-center gap-1 text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {tour._count.reviews} reviews
            </span>
            <span className="flex items-center gap-1 text-sky-600">
              <BookOpen className="h-3.5 w-3.5" />
              {tour._count.bookings} bookings
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
          <Button
            size="sm"
            onClick={() => onEdit(tour)}
            disabled={isLoading}
            className="flex-1 gap-1.5"
            variant="outline"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>

          <button
            onClick={() => onToggle(tour)}
            disabled={isLoading}
            title={tour.isActive ? "Unpublish" : "Publish"}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : tour.isActive ? (
              <EyeOff className="h-4 w-4 text-amber-500" />
            ) : (
              <Eye className="h-4 w-4 text-emerald-500" />
            )}
          </button>

          <button
            onClick={() => onDelete(tour)}
            disabled={isLoading}
            title="Delete tour"
            className="rounded-xl border border-slate-200 p-2 hover:bg-rose-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 text-rose-400" />
          </button>

          <Link href={`/tours/${tour.id}`} target="_blank">
            <button
              className="rounded-xl border border-slate-200 p-2 hover:bg-sky-50"
              title="Preview tour"
            >
              <Eye className="h-4 w-4 text-sky-500" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Tour Card Skeleton ───────────────────────────────────────────────────────

function TourCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-44 bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-2/3 rounded bg-slate-100" />
        <div className="flex gap-2">
          <div className="h-8 flex-1 rounded bg-slate-100" />
          <div className="h-8 w-8 rounded bg-slate-100" />
          <div className="h-8 w-8 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

// ─── Tour Form Modal ──────────────────────────────────────────────────────────

function TourFormModal({
  editingTour,
  onClose,
  onSaved,
}: {
  editingTour: Tour | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<TourFormState>(
    editingTour ? tourToForm(editingTour) : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const set = (field: keyof TourFormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.category || !form.price || !form.duration) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    const payload = formToPayload(form);
    const toastId = toast.loading(
      editingTour ? "Saving changes…" : "Creating tour…"
    );

    try {
      if (editingTour) {
        await api.patch(`/tours/${editingTour.id}`, payload);
        toast.success("Tour updated!", { id: toastId });
      } else {
        await api.post("/tours", payload);
        toast.success("Tour created!", { id: toastId });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Something went wrong";
      toast.error(msg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm px-4 py-8"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editingTour ? "Edit Tour" : "Create New Tour"}
            </h2>
            <p className="text-xs text-slate-400">
              {editingTour
                ? "Update your tour listing details"
                : "Fill in the details to publish a new tour"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Historic Old Town Walking Tour"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              className={`${inputCls} min-h-[100px] resize-y`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe your tour experience…"
              required
            />
          </div>

          {/* Category + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
              >
                <option value="">Select category…</option>
                {TOUR_CATEGORIES.filter((c) => c.value !== "").map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div
                  onClick={() => set("isActive", !form.isActive)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    form.isActive ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      form.isActive ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {form.isActive ? "Published" : "Unpublished"}
                </span>
              </label>
            </div>
          </div>

          {/* Price, Duration, MaxGroup */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Price ($) <span className="text-rose-500">*</span>
              </label>
              <input
                className={inputCls}
                type="number"
                min="1"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="50"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Duration (hours) <span className="text-rose-500">*</span>
              </label>
              <input
                className={inputCls}
                type="number"
                min="1"
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="3"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Max Group Size
              </label>
              <input
                className={inputCls}
                type="number"
                min="1"
                value={form.maxGroupSize}
                onChange={(e) => set("maxGroupSize", e.target.value)}
                placeholder="10"
              />
            </div>
          </div>

          {/* City, Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                className={inputCls}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Paris"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Country <span className="text-rose-500">*</span>
              </label>
              <input
                className={inputCls}
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                placeholder="e.g. France"
                required
              />
            </div>
          </div>

          {/* Meeting Point */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Meeting Point
            </label>
            <input
              className={inputCls}
              value={form.meetingPoint}
              onChange={(e) => set("meetingPoint", e.target.value)}
              placeholder="e.g. Main entrance of the Louvre Museum"
            />
          </div>

          {/* Images */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <ImageIcon className="h-3.5 w-3.5" />
              Image URLs
              <span className="font-normal text-slate-400">(comma-separated)</span>
            </label>
            <textarea
              className={`${inputCls} min-h-[64px] resize-y`}
              value={form.imagesRaw}
              onChange={(e) => set("imagesRaw", e.target.value)}
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
            />
            {/* Preview first image */}
            {form.imagesRaw.split(",")[0]?.trim() && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {form.imagesRaw
                  .split(",")
                  .map((url) => url.trim())
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((url, i) => (
                    <div
                      key={i}
                      className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200"
                    >
                      <Image
                        src={url}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="80px"
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Included / Excluded */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-emerald-600">
                ✅ What&apos;s Included
                <span className="ml-1 font-normal text-slate-400">(one per line)</span>
              </label>
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={form.includedRaw}
                onChange={(e) => set("includedRaw", e.target.value)}
                placeholder={"Hotel pickup\nGuide\nWater bottle"}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-rose-600">
                ❌ What&apos;s Excluded
                <span className="ml-1 font-normal text-slate-400">(one per line)</span>
              </label>
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={form.excludedRaw}
                onChange={(e) => set("excludedRaw", e.target.value)}
                placeholder={"Entry tickets\nMeals\nTips"}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2 min-w-[120px]">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingTour ? "Save Changes" : "Create Tour"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page Content ─────────────────────────────────────────────────────────────

function GuideToursContent() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "unpublished">("all");

  const fetchTours = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/tours/my/listings");
      setTours(res.data?.data ?? []);
    } catch {
      toast.error("Failed to load your tours.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const openCreate = () => {
    setEditingTour(null);
    setModalOpen(true);
  };

  const openEdit = (tour: Tour) => {
    setEditingTour(tour);
    setModalOpen(true);
  };

  const handleToggle = async (tour: Tour) => {
    setActionId(tour.id);
    const toastId = toast.loading(
      tour.isActive ? "Unpublishing tour…" : "Publishing tour…"
    );
    try {
      await api.patch(`/tours/${tour.id}`, { isActive: !tour.isActive });
      toast.success(tour.isActive ? "Tour unpublished." : "Tour published!", {
        id: toastId,
      });
      fetchTours();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Action failed";
      toast.error(msg, { id: toastId });
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (tour: Tour) => {
    if (!confirm(`Delete "${tour.title}"? This will unpublish the tour.`))
      return;
    setActionId(tour.id);
    const toastId = toast.loading("Deleting tour…");
    try {
      await api.delete(`/tours/${tour.id}`);
      toast.success("Tour deleted.", { id: toastId });
      fetchTours();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Delete failed";
      toast.error(msg, { id: toastId });
    } finally {
      setActionId(null);
    }
  };

  const filtered = tours.filter((t) => {
    if (filter === "published") return t.isActive;
    if (filter === "unpublished") return !t.isActive;
    return true;
  });

  const publishedCount = tours.filter((t) => t.isActive).length;
  const totalBookings = tours.reduce(
    (s, t) => s + (t._count?.bookings ?? 0),
    0
  );
  const totalReviews = tours.reduce(
    (s, t) => s + (t._count?.reviews ?? 0),
    0
  );

  return (
    <>
      {/* Modal */}
      {modalOpen && (
        <TourFormModal
          editingTour={editingTour}
          onClose={() => setModalOpen(false)}
          onSaved={fetchTours}
        />
      )}

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-sky-700 px-4 py-10 text-white">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/dashboard/guide"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-indigo-200 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">My Tour Listings</h1>
                <p className="mt-1 text-indigo-100">
                  {tours.length} tour{tours.length !== 1 ? "s" : ""} ·{" "}
                  {publishedCount} published
                </p>
              </div>
              <Button
                onClick={openCreate}
                className="gap-2 bg-white text-indigo-700 hover:bg-indigo-50"
              >
                <Plus className="h-4 w-4" />
                New Tour
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8">
          {/* Stats row */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            {[
              { label: "Total Tours", value: tours.length, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Total Bookings", value: totalBookings, color: "text-sky-600", bg: "bg-sky-50" },
              { label: "Total Reviews", value: totalReviews, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
              >
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
            {(["all", "published", "unpublished"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f}
                {f === "all" && tours.length > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${filter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {tours.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <TourCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
              <span className="mb-3 text-5xl">🗺️</span>
              <h3 className="text-lg font-semibold text-slate-700">
                {filter === "all" ? "No tours yet" : `No ${filter} tours`}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {filter === "all"
                  ? "Create your first tour listing and start accepting bookings!"
                  : "No tours match this filter."}
              </p>
              {filter === "all" && (
                <Button onClick={openCreate} className="mt-5 gap-2">
                  <Plus className="h-4 w-4" />
                  Create My First Tour
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  onEdit={openEdit}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  actionId={actionId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GuideToursPage() {
  return (
    <ProtectedRoute allow={["GUIDE"]}>
      <GuideToursContent />
    </ProtectedRoute>
  );
}
