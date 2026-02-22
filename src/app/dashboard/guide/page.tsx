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
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  Phone,
  Mail,
  Map,
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

// ─── Request Card ─────────────────────────────────────────────────────────────

function BookingRequestCard({
  booking,
  onAction,
  actionLoading,
}: {
  booking: Booking;
  onAction: (id: string, status: "CONFIRMED" | "REJECTED") => void;
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

  const canAct = booking.status === "PENDING";
  const isPaid = booking.payment?.paymentStatus === "completed";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
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
            <div className="flex flex-col items-end gap-1.5">
              <StatusBadge status={booking.status} />
              {isPaid && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  ✓ Paid
                </span>
              )}
            </div>
          </div>

          {/* Tourist info */}
          {booking.tourist && (
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                {booking.tourist.profile?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  {booking.tourist.profile?.name ?? "Unknown tourist"}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {booking.tourist.email}
                  </span>
                  {booking.tourist.profile?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {booking.tourist.profile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Special requests */}
          {booking.specialRequests && (
            <p className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <span className="font-medium">Special request: </span>
              {booking.specialRequests}
            </p>
          )}

          {/* Bottom: price + actions */}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span className="text-lg font-bold text-sky-700">
              ${booking.totalPrice}
            </span>

            <div className="flex items-center gap-2">
              {canAct && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onAction(booking.id, "CONFIRMED")}
                    disabled={isLoading}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(booking.id, "REJECTED")}
                    disabled={isLoading}
                    className="gap-1.5 text-rose-600 ring-rose-200 hover:bg-rose-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    Reject
                  </Button>
                </>
              )}
              <Link href={`/tours/${booking.tourId}`}>
                <Button size="sm" variant="ghost" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Tour
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
          <div className="h-10 w-full rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: { label: string; value: BookingStatus | "ALL" }[] = [
  { label: "All Requests", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Rejected", value: "REJECTED" },
];

// ─── Stats card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}

// ─── Revenue card ─────────────────────────────────────────────────────────────

function RevenueCard({ bookings }: { bookings: Booking[] }) {
  const earned = bookings
    .filter(
      (b) =>
        b.status === "CONFIRMED" || b.status === "COMPLETED"
    )
    .reduce((s, b) => s + b.totalPrice, 0);

  const pending = bookings
    .filter((b) => b.status === "PENDING")
    .reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        Revenue Overview
      </p>
      <div className="mt-3 flex items-center justify-around gap-4">
        <div className="text-center">
          <p className="text-xl font-bold text-sky-700">${earned}</p>
          <p className="text-xs text-slate-500">Confirmed</p>
        </div>
        <div className="h-8 w-px bg-slate-200" />
        <div className="text-center">
          <p className="text-xl font-bold text-amber-600">${pending}</p>
          <p className="text-xs text-slate-500">Pending</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function GuideDashboardContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BookingStatus | "ALL">("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/bookings/guide-bookings");
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

  const handleAction = async (
    bookingId: string,
    status: "CONFIRMED" | "REJECTED"
  ) => {
    setActionLoading(bookingId);
    const verb = status === "CONFIRMED" ? "Confirming" : "Rejecting";
    const toastId = toast.loading(`${verb} booking...`);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      toast.success(
        `Booking ${status === "CONFIRMED" ? "confirmed" : "rejected"} successfully`,
        { id: toastId }
      );
      await fetchBookings();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Action failed";
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
      <div className="bg-gradient-to-r from-indigo-700 to-sky-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Guide Dashboard</h1>
              <p className="mt-1 text-indigo-100">
                Manage booking requests from tourists
              </p>
            </div>
            <Link href="/dashboard/guide/tours">
              <Button className="gap-2 bg-white text-indigo-700 hover:bg-indigo-50">
                <Map className="h-4 w-4" />
                Manage My Tours
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Stats + Revenue */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Pending"
            value={counts["PENDING"] ?? 0}
            color={STATUS_CONFIG.PENDING.color}
          />
          <StatCard
            label="Confirmed"
            value={counts["CONFIRMED"] ?? 0}
            color={STATUS_CONFIG.CONFIRMED.color}
          />
          <StatCard
            label="Completed"
            value={counts["COMPLETED"] ?? 0}
            color={STATUS_CONFIG.COMPLETED.color}
          />
          <StatCard
            label="Rejected"
            value={counts["REJECTED"] ?? 0}
            color={STATUS_CONFIG.REJECTED.color}
          />
        </div>

        <div className="mb-6">
          <RevenueCard bookings={bookings} />
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.value
                  ? "bg-indigo-600 text-white shadow"
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
            <span className="mb-3 text-5xl">📋</span>
            <h3 className="text-lg font-semibold text-slate-700">
              No {activeTab !== "ALL" ? STATUS_CONFIG[activeTab as BookingStatus].label.toLowerCase() : ""} bookings
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {activeTab === "ALL"
                ? "No booking requests yet. Make sure your tours are published!"
                : "Nothing here yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <BookingRequestCard
                key={booking.id}
                booking={booking}
                onAction={handleAction}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuideDashboardPage() {
  return (
    <ProtectedRoute allow={["GUIDE"]}>
      <GuideDashboardContent />
    </ProtectedRoute>
  );
}
