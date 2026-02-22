"use client";

import { useEffect, useCallback, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Tour } from "@/types/tour";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Clock,
  Users,
  Star,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Calendar,
  Loader2,
  User,
  Shield,
} from "lucide-react";
import {
  AvailabilityCalendar,
  AvailDate,
} from "@/components/shared/availability-calendar";
import { TourMap } from "@/components/shared/tour-map";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${
            s <= Math.round(rating)
              ? "fill-amber-400 stroke-amber-400"
              : "stroke-slate-300"
          }`}
        />
      ))}
    </span>
  );
}

function Avatar({ name, src }: { name: string; src?: string | null }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
        unoptimized
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

// ─── Booking Widget ───────────────────────────────────────────────────────────

function BookingWidget({ tour }: { tour: Tour }) {
  const { user } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [availDates, setAvailDates] = useState<AvailDate[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  const total = tour.price * people;
  const today = new Date().toISOString().split("T")[0];

  // Fetch availability on mount
  useEffect(() => {
    const fetchAvail = async () => {
      setLoadingAvail(true);
      try {
        const res = await api.get(`/tours/${tour.id}/availability`);
        const data: AvailDate[] = res.data?.data ?? [];
        setAvailDates(data);
        if (data.length === 0) setShowFallback(true);
      } catch {
        setShowFallback(true);
      } finally {
        setLoadingAvail(false);
      }
    };
    fetchAvail();
  }, [tour.id]);

  const handleBook = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to book this tour");
      router.push(`/login`);
      return;
    }

    if (user.role !== "TOURIST") {
      toast.error("Only tourists can book tours");
      return;
    }

    if (!date) {
      toast.error("Please select a booking date");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Sending booking request...");

    try {
      await api.post("/bookings", {
        tourId: tour.id,
        bookingDate: new Date(date).toISOString(),
        numberOfPeople: people,
        specialRequests: notes || undefined,
      });
      toast.success("Booking request sent! The guide will confirm shortly 🎉", {
        id: toastId,
      });
      router.push("/dashboard/tourist");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Booking failed. Please try again.";
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
      <div className="mb-4 text-center">
        <span className="text-3xl font-bold text-sky-700">${tour.price}</span>
        <span className="ml-1 text-sm text-slate-500">per person</span>
      </div>

      <form onSubmit={handleBook} className="space-y-4">
        {/* ── Date picker: calendar or fallback ── */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <Calendar className="h-4 w-4 text-sky-500" />
            Select a Date
          </label>

          {loadingAvail ? (
            <div className="flex items-center justify-center py-6 text-sky-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : showFallback || availDates.length === 0 ? (
            <>
              <Input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-11"
              />
              <p className="text-xs text-slate-400">
                No specific availability set — pick any future date.
              </p>
            </>
          ) : (
            <>
              <AvailabilityCalendar
                mode="view"
                availDates={availDates}
                selectedDate={date}
                onSelectDate={(d) => setDate(d)}
              />
              {date && (
                <p className="text-xs font-semibold text-emerald-600">
                  ✅ Selected:{" "}
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </>
          )}
        </div>

        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <Users className="h-4 w-4 text-sky-500" />
            Number of People
          </label>
          <Input
            type="number"
            min={1}
            max={tour.maxGroupSize}
            value={people}
            onChange={(e) => setPeople(Math.min(Number(e.target.value), tour.maxGroupSize))}
            required
            className="h-11"
          />
          <p className="text-xs text-slate-400">Max group size: {tour.maxGroupSize}</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">
            Special Requests{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any dietary needs, accessibility requirements..."
            rows={3}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Price breakdown */}
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>${tour.price} × {people} person{people > 1 ? "s" : ""}</span>
            <span>${total}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-800">
            <span>Total</span>
            <span className="text-sky-700">${total}</span>
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="h-11 w-full text-base font-semibold">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Requesting...
            </>
          ) : user ? (
            "Request to Book"
          ) : (
            "Login to Book"
          )}
        </Button>
      </form>

      <p className="mt-3 text-center text-xs text-slate-400">
        No charge until the guide confirms your booking
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/tours/${id}`);
        setTour(res.data?.data ?? null);
      } catch {
        toast.error("Failed to load tour details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-2/3 rounded bg-slate-200" />
          <div className="h-72 rounded-2xl bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="col-span-2 space-y-4">
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-5/6 rounded bg-slate-200" />
              <div className="h-4 w-4/6 rounded bg-slate-200" />
            </div>
            <div className="h-64 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <span className="text-5xl">😕</span>
        <p className="text-lg font-semibold text-slate-700">Tour not found</p>
        <Link href="/explore">
          <Button variant="outline">Browse all tours</Button>
        </Link>
      </div>
    );
  }

  const fallback = `https://source.unsplash.com/800x500/?travel,${tour.category.toLowerCase()}`;
  const images = tour.images?.length ? tour.images : [fallback];
  const avgRating = tour.averageRating ?? 0;
  const reviewCount = tour._count?.reviews ?? tour.reviews?.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Back button */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-sky-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 pt-4">
        {/* ── Title row ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="mb-2 inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              {tour.category}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              {tour.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-sky-500" />
                {tour.city}, {tour.country}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-sky-500" />
                {tour.duration} hours
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-sky-500" />
                Max {tour.maxGroupSize} people
              </span>
              {avgRating > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                  <strong className="text-slate-700">{avgRating.toFixed(1)}</strong>
                  <span className="text-slate-400">({reviewCount} reviews)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Image gallery ── */}
        <div className="space-y-2">
          <div className="relative h-64 overflow-hidden rounded-2xl bg-slate-200 md:h-96">
            <Image
              src={images[activeImage] || fallback}
              alt={tour.title}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              unoptimized
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    activeImage === i
                      ? "border-sky-500"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`thumbnail ${i}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Main layout: content + booking widget ── */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Content column */}
          <div className="space-y-7 lg:col-span-2">

            {/* Description */}
            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-800">
                About This Tour
              </h2>
              <p className="leading-relaxed text-slate-600">{tour.description}</p>
            </section>

            {/* Meeting point + Interactive Map */}
            <section>
              <TourMap
                city={tour.city}
                country={tour.country}
                meetingPoint={tour.meetingPoint}
                title={tour.title}
              />
            </section>

            {/* Included / Excluded */}
            {(tour.included?.length > 0 || tour.excluded?.length > 0) && (
              <section className="grid gap-4 sm:grid-cols-2">
                {tour.included?.length > 0 && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      What&apos;s Included
                    </h3>
                    <ul className="space-y-1.5">
                      {tour.included.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tour.excluded?.length > 0 && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <XCircle className="h-4 w-4 text-rose-400" />
                      Not Included
                    </h3>
                    <ul className="space-y-1.5">
                      {tour.excluded.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Guide profile card */}
            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-800">
                Your Guide
              </h2>
              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Avatar
                  name={tour.guide?.profile?.name ?? "Guide"}
                  src={tour.guide?.profile?.profilePicture}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-800">
                      {tour.guide?.profile?.name ?? "Local Guide"}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                      <Shield className="h-3 w-3" />
                      Verified Guide
                    </span>
                  </div>
                  {avgRating > 0 && (
                    <div className="mt-1 flex items-center gap-2">
                      <StarRow rating={avgRating} />
                      <span className="text-xs text-slate-500">
                        {avgRating.toFixed(1)} · {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  <Link
                    href={`/guides/${tour.guideId}`}
                    className="mt-2 inline-block text-sm font-medium text-sky-600 hover:underline"
                  >
                    View full profile →
                  </Link>
                </div>
              </div>
            </section>

            {/* Reviews */}
            {tour.reviews && tour.reviews.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-bold text-slate-800">
                  Reviews{" "}
                  <span className="ml-1 text-base font-normal text-slate-400">
                    ({tour.reviews.length})
                  </span>
                </h2>
                <div className="space-y-4">
                  {tour.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar
                          name={review.user?.profile?.name ?? review.user?.email ?? "U"}
                          src={review.user?.profile?.profilePicture}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-800">
                              {review.user?.profile?.name ?? review.user?.email ?? "Traveller"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="mt-1">
                            <StarRow rating={review.rating} />
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* No reviews placeholder */}
            {(!tour.reviews || tour.reviews.length === 0) && (
              <section>
                <h2 className="mb-3 text-lg font-bold text-slate-800">Reviews</h2>
                <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
                  <User className="h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">
                    No reviews yet — be the first!
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Booking widget (sticky on desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingWidget tour={tour} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
