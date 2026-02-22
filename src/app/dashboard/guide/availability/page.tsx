"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, CalendarDays, Info, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { PageLoader } from "@/components/shared/page-loader";
import {
  AvailabilityCalendar,
  AvailDate,
} from "@/components/shared/availability-calendar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GuideTour {
  id: string;
  title: string;
  city: string;
  isActive: boolean;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManageAvailabilityPage() {
  const { user } = useAuth();
  const [tours, setTours] = useState<GuideTour[]>([]);
  const [selectedTour, setSelectedTour] = useState<GuideTour | null>(null);
  const [availDates, setAvailDates] = useState<AvailDate[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [loadingDates, setLoadingDates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState(1);

  // Fetch guide's tours
  const fetchTours = useCallback(async () => {
    setLoadingTours(true);
    try {
      const res = await api.get("/tours/my/listings");
      setTours(res.data?.data ?? []);
    } catch {
      toast.error("Failed to load your tours.");
    } finally {
      setLoadingTours(false);
    }
  }, []);

  // Fetch availability for selected tour
  const fetchAvailability = useCallback(async (tourId: string) => {
    setLoadingDates(true);
    try {
      const res = await api.get(`/tours/${tourId}/availability`);
      setAvailDates(res.data?.data ?? []);
    } catch {
      toast.error("Failed to load availability.");
    } finally {
      setLoadingDates(false);
    }
  }, []);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  useEffect(() => {
    if (selectedTour) fetchAvailability(selectedTour.id);
  }, [selectedTour, fetchAvailability]);

  if (!user) return <PageLoader message="Checking authentication…" />;

  const handleAddDate = async (dateStr: string) => {
    if (!selectedTour) return;
    setSaving(true);
    try {
      await api.post(`/tours/${selectedTour.id}/availability`, {
        dates: [{ date: dateStr, slots }],
      });
      toast.success(`${dateStr} marked as available (${slots} slot${slots !== 1 ? "s" : ""})`);
      fetchAvailability(selectedTour.id);
    } catch {
      toast.error("Failed to add date.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDate = async (availId: string) => {
    if (!selectedTour) return;
    setSaving(true);
    try {
      await api.delete(`/tours/${selectedTour.id}/availability/${availId}`);
      toast.success("Date removed.");
      fetchAvailability(selectedTour.id);
    } catch {
      toast.error("Failed to remove date.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sky-600 text-sm font-semibold">
            <CalendarDays className="h-4 w-4" />
            Guide Dashboard
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-800 md:text-3xl">
            📅 Manage Availability
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            Select a tour and mark the dates you&apos;re available to guide.
            Tourists can only book on dates you&apos;ve marked.
          </p>
        </div>

        {/* Info box */}
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>How it works:</strong> Click any future date on the calendar
            to mark it available. Click a blue date to remove it. Tourists will
            see these dates when booking.
          </p>
        </div>

        {/* Tour selector */}
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Select Tour
          </label>
          {loadingTours ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading tours…
            </div>
          ) : tours.length === 0 ? (
            <p className="text-sm text-slate-400">
              You have no tours yet. Create a tour first.
            </p>
          ) : (
            <div className="relative">
              <select
                value={selectedTour?.id ?? ""}
                onChange={(e) => {
                  const t = tours.find((t) => t.id === e.target.value) ?? null;
                  setSelectedTour(t);
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-9 text-sm text-slate-800 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              >
                <option value="">-- Choose a tour --</option>
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.city})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          )}
        </div>

        {/* Slots per date */}
        {selectedTour && (
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Slots per date (max bookings per day)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSlots((s) => Math.max(1, s - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-600 hover:bg-slate-50"
              >
                −
              </button>
              <span className="w-8 text-center text-lg font-bold text-slate-800">
                {slots}
              </span>
              <button
                onClick={() => setSlots((s) => Math.min(20, s + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-600 hover:bg-slate-50"
              >
                +
              </button>
              <p className="text-xs text-slate-400">
                How many tourists can book on the same day
              </p>
            </div>
          </div>
        )}

        {/* Calendar */}
        {selectedTour ? (
          loadingDates ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
            </div>
          ) : (
            <div className="space-y-3">
              <AvailabilityCalendar
                mode="manage"
                availDates={availDates}
                onAddDate={handleAddDate}
                onRemoveDate={handleRemoveDate}
                loading={saving}
              />
              {/* Summary list */}
              {availDates.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">
                    Upcoming Available Dates ({availDates.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {availDates.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200"
                      >
                        <span>
                          {new Date(a.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-sky-400">·</span>
                        <span>{a.slots} slot{a.slots !== 1 ? "s" : ""}</span>
                        <button
                          onClick={() => handleRemoveDate(a.id)}
                          className="ml-0.5 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remove date"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
            <CalendarDays className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-slate-400">Select a tour above to manage its availability</p>
          </div>
        )}
      </div>
    </div>
  );
}
