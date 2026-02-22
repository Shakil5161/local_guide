/**
 * Guide Badge System
 * ──────────────────
 * Badges are computed on the frontend from existing guide data.
 * No backend changes needed.
 *
 * Badge rules:
 *  🏅 Super Guide      → isVerified + tours >= 5 + yearsOfExp >= 2
 *  ⭐ Top Rated        → avgRating >= 4.8 (needs reviews array)
 *  🌟 Rising Star      → isVerified + joined within last 90 days (not newcomer)
 *  🆕 Newcomer         → joined within last 30 days
 *  🍜 Foodie Expert    → expertise includes "food" / "culinary" / "gastronomy"
 *  🏛️ History Buff     → expertise includes "history" / "heritage" / "culture"
 *  🌿 Nature Guide     → expertise includes "nature" / "trekking" / "hiking"
 *  📸 Photo Pro        → expertise includes "photography"
 *  🌐 Polyglot         → speaks 3+ languages
 *  🎒 Adventure Expert → expertise includes "adventure" / "extreme" / "sport"
 */

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BadgeInput {
  isVerified: boolean;
  yearsOfExperience: number | null;
  tourCount: number;             // guide.user._count.toursAsGuide  OR  tours.length
  avgRating: number | null;      // pre-computed or null
  reviewCount: number;           // total reviews
  expertise: string[];
  languages: string[];
  createdAt?: string | null;     // ISO string, used for Newcomer / Rising Star
}

export interface BadgeDef {
  key: string;
  emoji: string;
  label: string;
  color: string;         // Tailwind bg + text classes
  ring: string;          // Tailwind ring class
  description: string;
}

// ─── Badge definitions ────────────────────────────────────────────────────────

const BADGE_DEFS: BadgeDef[] = [
  {
    key: "super_guide",
    emoji: "🏅",
    label: "Super Guide",
    color: "bg-amber-50 text-amber-700",
    ring: "ring-amber-200",
    description: "Verified guide with 5+ tours and 2+ years of experience",
  },
  {
    key: "top_rated",
    emoji: "⭐",
    label: "Top Rated",
    color: "bg-yellow-50 text-yellow-700",
    ring: "ring-yellow-200",
    description: "Maintains an average rating of 4.8 or above",
  },
  {
    key: "rising_star",
    emoji: "🌟",
    label: "Rising Star",
    color: "bg-indigo-50 text-indigo-700",
    ring: "ring-indigo-200",
    description: "A verified newcomer who joined in the last 3 months",
  },
  {
    key: "newcomer",
    emoji: "🆕",
    label: "Newcomer",
    color: "bg-emerald-50 text-emerald-700",
    ring: "ring-emerald-200",
    description: "Just joined the Local Guide community",
  },
  {
    key: "foodie_expert",
    emoji: "🍜",
    label: "Foodie Expert",
    color: "bg-orange-50 text-orange-700",
    ring: "ring-orange-200",
    description: "Specialises in food, culinary, and gastronomy tours",
  },
  {
    key: "history_buff",
    emoji: "🏛️",
    label: "History Buff",
    color: "bg-rose-50 text-rose-700",
    ring: "ring-rose-200",
    description: "Expert in history, heritage, and cultural tours",
  },
  {
    key: "nature_guide",
    emoji: "🌿",
    label: "Nature Guide",
    color: "bg-green-50 text-green-700",
    ring: "ring-green-200",
    description: "Leads nature treks, hikes, and wildlife tours",
  },
  {
    key: "photo_pro",
    emoji: "📸",
    label: "Photo Pro",
    color: "bg-pink-50 text-pink-700",
    ring: "ring-pink-200",
    description: "Specialises in photography walks and tours",
  },
  {
    key: "polyglot",
    emoji: "🌐",
    label: "Polyglot",
    color: "bg-sky-50 text-sky-700",
    ring: "ring-sky-200",
    description: "Fluent in 3 or more languages",
  },
  {
    key: "adventure_expert",
    emoji: "🎒",
    label: "Adventure Expert",
    color: "bg-violet-50 text-violet-700",
    ring: "ring-violet-200",
    description: "Expert in adventure, extreme sports, and outdoor activities",
  },
];

// ─── Badge computation ────────────────────────────────────────────────────────

export function computeBadges(input: BadgeInput): BadgeDef[] {
  const earned: string[] = [];
  const exp = input.expertise.map((e) => e.toLowerCase());

  const daysOld = input.createdAt
    ? Math.floor(
        (Date.now() - new Date(input.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  // Super Guide
  if (
    input.isVerified &&
    input.tourCount >= 5 &&
    (input.yearsOfExperience ?? 0) >= 2
  ) {
    earned.push("super_guide");
  }

  // Top Rated (needs avgRating)
  if (input.avgRating !== null && input.avgRating >= 4.8 && input.reviewCount >= 3) {
    earned.push("top_rated");
  }

  // Rising Star (verified + joined 31–90 days ago)
  if (
    input.isVerified &&
    daysOld !== null &&
    daysOld > 30 &&
    daysOld <= 90
  ) {
    earned.push("rising_star");
  }

  // Newcomer (joined within last 30 days)
  if (daysOld !== null && daysOld <= 30) {
    earned.push("newcomer");
  }

  // Foodie Expert
  if (
    exp.some((e) =>
      ["food", "culinary", "gastronomy", "cuisine", "cooking"].some((k) =>
        e.includes(k)
      )
    )
  ) {
    earned.push("foodie_expert");
  }

  // History Buff
  if (
    exp.some((e) =>
      ["history", "heritage", "culture", "cultural", "museum", "archeology"].some(
        (k) => e.includes(k)
      )
    )
  ) {
    earned.push("history_buff");
  }

  // Nature Guide
  if (
    exp.some((e) =>
      ["nature", "trekking", "hiking", "wildlife", "eco", "forest", "mountain"].some(
        (k) => e.includes(k)
      )
    )
  ) {
    earned.push("nature_guide");
  }

  // Photo Pro
  if (exp.some((e) => e.includes("photo"))) {
    earned.push("photo_pro");
  }

  // Polyglot (3+ languages)
  if (input.languages.length >= 3) {
    earned.push("polyglot");
  }

  // Adventure Expert
  if (
    exp.some((e) =>
      ["adventure", "extreme", "sport", "rafting", "climbing", "diving", "surf"].some(
        (k) => e.includes(k)
      )
    )
  ) {
    earned.push("adventure_expert");
  }

  return BADGE_DEFS.filter((b) => earned.includes(b.key));
}

// ─── GuideBadge Component (single pill) ──────────────────────────────────────

export function GuideBadge({
  badge,
  size = "sm",
  showTooltip = true,
}: {
  badge: BadgeDef;
  size?: "xs" | "sm" | "md";
  showTooltip?: boolean;
}) {
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      title={showTooltip ? badge.description : undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold ring-1",
        badge.color,
        badge.ring,
        sizeClasses[size]
      )}
    >
      <span>{badge.emoji}</span>
      {badge.label}
    </span>
  );
}

// ─── GuideBadgeList Component (a row of pills) ────────────────────────────────

export function GuideBadgeList({
  badges,
  max,
  size = "sm",
}: {
  badges: BadgeDef[];
  max?: number;
  size?: "xs" | "sm" | "md";
}) {
  if (badges.length === 0) return null;
  const shown = max ? badges.slice(0, max) : badges;
  const remaining = max ? badges.length - max : 0;

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((b) => (
        <GuideBadge key={b.key} badge={b} size={size} />
      ))}
      {remaining > 0 && (
        <span
          className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200"
          title={badges
            .slice(max)
            .map((b) => b.label)
            .join(", ")}
        >
          +{remaining} more
        </span>
      )}
    </div>
  );
}
