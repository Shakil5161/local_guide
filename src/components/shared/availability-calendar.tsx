"use client";

/**
 * AvailabilityCalendar
 * ────────────────────
 * A lightweight month-view calendar built with pure Tailwind.
 * No external calendar library needed.
 *
 * Two modes:
 *  - "view"   → tourist/public mode: shows available dates, user picks one
 *  - "manage" → guide mode: click to add/remove available dates
 */

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvailDate {
  id: string;
  date: string; // ISO string
  slots: number;
}

interface Props {
  mode: "view" | "manage";
  availDates: AvailDate[];
  selectedDate?: string | null;
  onSelectDate?: (dateStr: string) => void;
  onAddDate?: (dateStr: string) => void;
  onRemoveDate?: (id: string) => void;
  loading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AvailabilityCalendar({
  mode,
  availDates,
  selectedDate,
  onSelectDate,
  onAddDate,
  onRemoveDate,
  loading = false,
}: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Build a map of YMD → AvailDate for O(1) lookup
  const availMap = useMemo(() => {
    const m: Record<string, AvailDate> = {};
    availDates.forEach((a) => {
      const d = new Date(a.date);
      m[toYMD(d)] = a;
    });
    return m;
  }, [availDates]);

  const cells = buildCalendarDays(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const handleDayClick = (day: Date) => {
    if (day < today) return; // past dates ignored
    const ymd = toYMD(day);
    if (mode === "view") {
      if (availMap[ymd]) onSelectDate?.(ymd);
    } else {
      // manage mode: toggle
      if (availMap[ymd]) {
        onRemoveDate?.(availMap[ymd].id);
      } else {
        onAddDate?.(ymd);
      }
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-semibold text-slate-800">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button
          onClick={nextMonth}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 text-[11px] font-semibold text-slate-400">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const ymd = toYMD(day);
          const isPast = day < today;
          const isAvail = !!availMap[ymd];
          const isSelected = selectedDate === ymd;
          const isToday = toYMD(day) === toYMD(today);

          return (
            <button
              key={ymd}
              onClick={() => handleDayClick(day)}
              disabled={isPast || (mode === "view" && !isAvail) || loading}
              title={
                isAvail
                  ? mode === "view"
                    ? `Available — ${availMap[ymd].slots} slot(s)`
                    : `Click to remove (${availMap[ymd].slots} slot)`
                  : mode === "manage" && !isPast
                  ? "Click to mark available"
                  : undefined
              }
              className={cn(
                "relative flex h-9 w-full items-center justify-center rounded-lg text-sm transition",
                // Past dates
                isPast && "cursor-not-allowed text-slate-300",
                // Available + view mode
                !isPast && isAvail && mode === "view" && !isSelected &&
                  "bg-emerald-50 font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100",
                // Available + manage mode
                !isPast && isAvail && mode === "manage" &&
                  "bg-sky-50 font-semibold text-sky-700 ring-1 ring-sky-200 hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200",
                // Not available + manage mode (can add)
                !isPast && !isAvail && mode === "manage" &&
                  "text-slate-600 hover:bg-slate-100",
                // Selected (view mode)
                isSelected &&
                  "bg-emerald-600 font-bold text-white ring-0 hover:bg-emerald-700",
                // Today marker
                isToday && !isSelected && !isAvail &&
                  "font-bold text-sky-600 underline decoration-sky-400 decoration-2 underline-offset-2",
              )}
            >
              {day.getDate()}
              {/* Dot indicator for available days in manage mode */}
              {isAvail && mode === "manage" && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sky-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
        {mode === "view" ? (
          <>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-emerald-100 ring-1 ring-emerald-300" />
              Available
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-emerald-600" />
              Selected
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <Plus className="h-3 w-3 text-slate-400" />
              Click date to mark available
            </span>
            <span className="flex items-center gap-1">
              <Trash2 className="h-3 w-3 text-slate-400" />
              Click blue date to remove
            </span>
          </>
        )}
      </div>
    </div>
  );
}
