import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  /** Text shown below the spinner. Defaults to "Loading…" */
  message?: string;
  /** Extra Tailwind classes for the wrapper */
  className?: string;
  /** Use a smaller, inline-style loader */
  size?: "sm" | "md" | "lg";
}

/**
 * Full-page (or section-level) branded loading indicator.
 * Used as the fallback for ProtectedRoute, Next.js route Suspense,
 * and any page that needs a loading state.
 */
export function PageLoader({
  message = "Loading…",
  className,
  size = "md",
}: PageLoaderProps) {
  const sizes = {
    sm: { wrap: "py-12", icon: "h-8 w-8", text: "text-sm" },
    md: { wrap: "py-24", icon: "h-12 w-12", text: "text-base" },
    lg: { wrap: "py-40", icon: "h-16 w-16", text: "text-lg" },
  };

  const s = sizes[size];

  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-5",
        s.wrap,
        className
      )}
    >
      {/* Branded logo-pin pulse ring */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-20" />
        {/* Icon container */}
        <div className="relative flex items-center justify-center rounded-full bg-sky-50 p-4 shadow-sm ring-1 ring-sky-100">
          <MapPin className={cn(s.icon, "text-sky-600")} />
          {/* Spinner overlay */}
          <Loader2
            className={cn(
              s.icon,
              "absolute animate-spin text-sky-500 opacity-40"
            )}
          />
        </div>
      </div>

      {/* Message */}
      <p className={cn("font-medium text-slate-500", s.text)}>{message}</p>
    </div>
  );
}
