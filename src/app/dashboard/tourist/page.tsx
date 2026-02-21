"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Booking, BookingStatus, STATUS_CONFIG } from "@/types/booking";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Users,
  CreditCard,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  Tag,
} from "lucide-react";

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onCancel,
  onPay,
  actionLoading,
}: {
  booking: Booking;
  onCancel: (id: string) => void;
  onPay: (id: string) => void;
  actionLoading: string | null;
}) {
  const fallback = `https://source.unsplash.com/400x300/?travel,${booking.tour.category?.toLowerCase() ?? "city"}`;
  const image = booking.tour.images?.[0] || fallback;
  const isLoading = actionLoading === booking.id;

  const bookingDate = new Date(booking.bookingDate).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const isPaid = booking.payment?.paymentStatus === "completed";
  const canPay = booking.status === "CONFIRMED" && !isPaid;
  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {/* Tour image */}
        <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-36">
          <Image
            src={image}
            alt={booking.tour.title}
            fill
            className="object-cover"
            unoptimized
            sizes="144px"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={`/tours/${booking.tourId}`}
                className="font-semibold text-slate-800 hover:text-sky-700 hover:underline"
              >
                {booking.tour.title}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-sky-500" />
                  {booking.tour.city}, {booking.tour.country}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-sky-500" />
                  {bookingDate}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-sky-500" />
                  {booking.numberOfPeople} person{booking.numberOfPeople > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-sky-500" />
                  {booking.tour.duration}h
                </span>
              </div>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          {/* Guide info */}
          {booking.guide?.profile && (
            <p className="text-xs text-slate-500">
              Guide:{" "}
              <span className="font-medium text-slate-700">
                {booking.guide.profile.name}
              </span>
            </p>
          )}

          {/* Special requests */}
          {booking.specialRequests && (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Note: </span>
              {booking.specialRequests}
            </p>
          )}

          {/* Bottom row: price + actions */}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <div>
              <span className="text-lg font-bold text-sky-700">
                ${booking.totalPrice}
              </span>
              {isPaid && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <Tag className="h-3 w-3" />
                  Paid
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {canPay && (
                <Button
                  size="sm"
                  onClick={() => onPay(booking.id)}
                  disabled={isLoading}
                  className="gap-1.5"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CreditCard className="h-3.5 w-3.5" />
                  )}
                  Pay Now
                </Button>
              )}

              {canCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancel(booking.id)}
                  disabled={isLoading}
                  className="gap-1.5 text-rose-600 ring-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  Cancel
                </Button>
              )}

              <Link href={`/tours/${booking.tourId}`}>
                <Button size="sm" variant="ghost" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Tour
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BookingSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex">
        <div className="h-32 w-36 shrink-0 bg-slate-200" />
        <div className="flex-1 space-y-3 p-4">
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="flex gap-3">
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-3 w-20 rounded bg-slate-100" />
          </div>
          <div className="h-3 w-1/3 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

// ─── Tab filter ───────────────────────────────────────────────────────────────

const TABS: { label: string; value: BookingStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function TouristDashboardContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BookingStatus | "ALL">("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/bookings/my-bookings");
      setBookings(res.data?.data ?? []);
    } catch {
      toast.error("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Re-fetch when user returns to this tab (e.g. coming back from Stripe Checkout)
  useEffect(() => {
    const onFocus = () => fetchBookings();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchBookings]);

  const handleCancel = async (bookingId: string) => {
    setActionLoading(bookingId);
    const toastId = toast.loading("Cancelling booking...");
    try {
      await api.patch(`/bookings/${bookingId}/status`, {
        status: "CANCELLED",
      });
      toast.success("Booking cancelled successfully", { id: toastId });
      await fetchBookings();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to cancel booking";
      toast.error(msg, { id: toastId });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePay = async (bookingId: string) => {
    setActionLoading(bookingId);
    const toastId = toast.loading("Redirecting to payment...");
    try {
      const res = await api.post("/payments/initiate", { bookingId });
      const checkoutUrl = res.data?.data?.checkoutUrl;
      toast.dismiss(toastId);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Could not get payment URL");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Payment initiation failed";
      toast.error(msg, { id: toastId });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered =
    activeTab === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);

  const counts = bookings.reduce(
    (acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-700 to-indigo-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold md:text-3xl">My Bookings</h1>
          <p className="mt-1 text-sky-100">
            {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as BookingStatus[]).map(
            (s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <div
                  key={s}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"
                >
                  <p className={`text-2xl font-bold ${cfg.color}`}>
                    {counts[s] ?? 0}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{cfg.label}</p>
                </div>
              );
            }
          )}
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.value
                  ? "bg-sky-600 text-white shadow"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              {tab.value !== "ALL" && counts[tab.value] ? (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeTab === tab.value
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {counts[tab.value]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <BookingSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
            <span className="mb-3 text-5xl">🗺️</span>
            <h3 className="text-lg font-semibold text-slate-700">
              No {activeTab !== "ALL" ? STATUS_CONFIG[activeTab].label.toLowerCase() : ""}{" "}
              bookings
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {activeTab === "ALL"
                ? "Start exploring tours and make your first booking!"
                : "Nothing here yet."}
            </p>
            {activeTab === "ALL" && (
              <Link href="/explore" className="mt-4">
                <Button size="sm">Explore Tours</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
                onPay={handlePay}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TouristDashboardPage() {
  return (
    <ProtectedRoute allow={["TOURIST"]}>
      <TouristDashboardContent />
    </ProtectedRoute>
  );
}
