"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { XCircle, Loader2, Home, LayoutDashboard, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Inner component ──────────────────────────────────────────────────────────

function CancelContent() {
  const params = useSearchParams();
  const router = useRouter();
  const paymentId = params.get("paymentId");

  const handleRetry = () => {
    // Simply go back to bookings, where they can click Pay Now again
    router.push("/dashboard/tourist");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
          <XCircle className="h-10 w-10 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800">
          Payment Cancelled
        </h1>
        <p className="mt-2 text-slate-500">
          You cancelled the payment. Your booking is still{" "}
          <span className="font-medium text-sky-700">confirmed</span> — you can
          pay anytime from your dashboard.
        </p>

        {paymentId && (
          <div className="mt-4 rounded-lg bg-slate-50 px-4 py-2.5 text-xs text-slate-400">
            Payment reference: <span className="font-mono">{paymentId}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={handleRetry} className="w-full sm:w-auto gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/dashboard/tourist">
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              My Bookings
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full sm:w-auto gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
