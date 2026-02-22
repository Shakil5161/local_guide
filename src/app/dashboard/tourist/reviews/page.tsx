"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/shared/page-loader";
import {
  Star,
  Pencil,
  Trash2,
  Loader2,
  X,
  MapPin,
  ArrowLeft,
  MessageSquarePlus,
  ExternalLink,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MyReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  tour: {
    title: string;
    city: string;
    guide: {
      profile: { name: string } | null;
    } | null;
  } | null;
  tourId?: string;
}

interface CompletedBooking {
  id: string;
  tourId: string;
  tour: {
    id: string;
    title: string;
    city: string;
    country: string;
    images: string[];
  };
}

// ─── Star Rating Picker ───────────────────────────────────────────────────────

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              n <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-semibold text-slate-600">
        {value > 0 ? ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value] : "Select rating"}
      </span>
    </div>
  );
}

// ─── Star Display ─────────────────────────────────────────────────────────────

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Review Edit Modal ────────────────────────────────────────────────────────

function ReviewModal({
  review,
  onClose,
  onSaved,
}: {
  review: MyReview | null; // null = create mode (need booking context)
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving review…");
    try {
      await api.patch(`/reviews/${review!.id}`, { rating, comment: comment.trim() });
      toast.success("Review updated!", { id: toastId });
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save";
      toast.error(msg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-800">Edit Review</h2>
            {review?.tour && (
              <p className="text-xs text-slate-400">{review.tour.title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Stars */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Your Rating
            </label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Your Review
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 min-h-[100px] resize-y"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience…"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-1.5 min-w-[120px]">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Write Review Modal (for completed bookings) ──────────────────────────────

function WriteReviewModal({
  booking,
  onClose,
  onSaved,
}: {
  booking: CompletedBooking;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error("Please select a star rating."); return; }
    if (!comment.trim()) { toast.error("Please write a comment."); return; }

    setSaving(true);
    const toastId = toast.loading("Submitting review…");
    try {
      await api.post("/reviews", {
        bookingId: booking.id,
        rating,
        comment: comment.trim(),
      });
      toast.success("Review submitted! Thank you.", { id: toastId });
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Submission failed";
      toast.error(msg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-800">Write a Review</h2>
            <p className="text-xs text-slate-400">
              {booking.tour.title} · {booking.tour.city}
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">Your Rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Your Review</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 min-h-[100px] resize-y"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience on this tour…"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving} className="gap-1.5 min-w-[140px]">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  onEdit,
  onDelete,
  actionId,
}: {
  review: MyReview;
  onEdit: (r: MyReview) => void;
  onDelete: (r: MyReview) => void;
  actionId: string | null;
}) {
  const isLoading = actionId === review.id;
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Tour info */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-800">
            {review.tour?.title ?? "Unknown Tour"}
          </p>
          {review.tour?.city && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3" />
              {review.tour.city}
              {review.tour.guide?.profile?.name && (
                <span className="ml-1">· Guide: {review.tour.guide.profile.name}</span>
              )}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {review.tourId && (
            <Link href={`/tours/${review.tourId}`} target="_blank">
              <button className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-50" title="View tour">
                <ExternalLink className="h-4 w-4" />
              </button>
            </Link>
          )}
          <button
            onClick={() => onEdit(review)}
            disabled={isLoading}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-600 disabled:opacity-50"
            title="Edit review"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(review)}
            disabled={isLoading}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
            title="Delete review"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className="mt-3 flex items-center gap-2">
        <StarDisplay rating={review.rating} />
        <span className="text-xs text-slate-400">{date}</span>
      </div>

      {/* Comment */}
      <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 leading-relaxed">
        &ldquo;{review.comment}&rdquo;
      </p>
    </div>
  );
}

// ─── Page Content ─────────────────────────────────────────────────────────────

function ReviewsContent() {
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [completedBookings, setCompletedBookings] = useState<CompletedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<MyReview | null>(null);
  const [writingBooking, setWritingBooking] = useState<CompletedBooking | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsRes, bookingsRes] = await Promise.all([
        api.get("/reviews/my-reviews"),
        api.get("/bookings/my-bookings"),
      ]);

      const myReviews: MyReview[] = reviewsRes.data?.data ?? [];
      setReviews(myReviews);

      // Find completed bookings that don't yet have a review
      const allBookings = bookingsRes.data?.data ?? [];
      const reviewedTourIds = new Set(
        myReviews.map((r) => r.tour?.title) // can't directly match tourId from review response
      );

      // We'll use tourId from reviews if available, else fall back to title matching
      const reviewedIds = new Set(myReviews.map((r) => r.tourId).filter(Boolean));

      const eligible = allBookings
        .filter(
          (b: { status: string; tourId: string }) =>
            b.status === "COMPLETED" && !reviewedIds.has(b.tourId)
        )
        .map(
          (b: {
            id: string;
            tourId: string;
            tour: { id: string; title: string; city: string; country: string; images: string[] };
          }) => ({
            id: b.id,
            tourId: b.tourId,
            tour: b.tour,
          })
        );

      // Also add tourId to reviews from booking data for "view tour" links
      const tourIdMap: Record<string, string> = {};
      allBookings.forEach(
        (b: { tourId: string; tour: { title: string } }) => {
          if (b.tour?.title) tourIdMap[b.tour.title] = b.tourId;
        }
      );
      setReviews(
        myReviews.map((r) => ({
          ...r,
          tourId: r.tourId ?? (r.tour?.title ? tourIdMap[r.tour.title] : undefined),
        }))
      );

      setCompletedBookings(eligible);
      void reviewedTourIds; // suppress unused warning
    } catch {
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (review: MyReview) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setActionId(review.id);
    const toastId = toast.loading("Deleting review…");
    try {
      await api.delete(`/reviews/${review.id}`);
      toast.success("Review deleted.", { id: toastId });
      fetchData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Delete failed";
      toast.error(msg, { id: toastId });
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <PageLoader message="Loading your reviews…" />;

  return (
    <>
      {editingReview && (
        <ReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSaved={fetchData}
        />
      )}
      {writingBooking && (
        <WriteReviewModal
          booking={writingBooking}
          onClose={() => setWritingBooking(null)}
          onSaved={fetchData}
        />
      )}

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-10 text-white">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/dashboard/tourist"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-amber-100 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold md:text-3xl">My Reviews</h1>
            <p className="mt-1 text-amber-100">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""} written
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
          {/* ── Write New Reviews ── */}
          {completedBookings.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-amber-800">
                <MessageSquarePlus className="h-5 w-5" />
                Tours awaiting your review ({completedBookings.length})
              </h2>
              <div className="space-y-2">
                {completedBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {b.tour.title}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {b.tour.city}, {b.tour.country}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setWritingBooking(b)}
                      className="shrink-0 gap-1.5 bg-amber-500 hover:bg-amber-600"
                    >
                      <Star className="h-3.5 w-3.5" />
                      Write Review
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── My Reviews List ── */}
          <div>
            <h2 className="mb-4 font-semibold text-slate-700">
              Your Reviews
            </h2>
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
                <span className="mb-3 text-5xl">⭐</span>
                <h3 className="text-lg font-semibold text-slate-700">
                  No reviews yet
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Complete a tour and share your experience!
                </p>
                <Link href="/explore" className="mt-5">
                  <Button size="sm" variant="outline">
                    Explore Tours
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    onEdit={setEditingReview}
                    onDelete={handleDelete}
                    actionId={actionId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TouristReviewsPage() {
  return (
    <ProtectedRoute allow={["TOURIST"]}>
      <ReviewsContent />
    </ProtectedRoute>
  );
}
