"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Home, LayoutDashboard, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type VerifyState = "verifying" | "success" | "error";

// ─── Inner component that uses useSearchParams ────────────────────────────────

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();

  const paymentId = params.get("paymentId");
  const sessionId = params.get("session_id");

  const [state, setState] = useState<VerifyState>("verifying");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!paymentId || !sessionId) {
      setErrorMsg("Missing payment information in URL.");
      setState("error");
      return;
    }

    // Call our backend to verify the Stripe session directly.
    // This works even without webhooks (important for local development).
    const verify = async () => {
      try {
        await api.post("/payments/verify-session", { sessionId, paymentId });
        setState("success");
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Payment verification failed.";
        setErrorMsg(msg);
        setState("error");
      }
    };

    verify();
  }, [paymentId, sessionId]);

  // Auto-redirect to dashboard 8 s after success
  useEffect(() => {
    if (state !== "success") return;
    const t = setTimeout(() => router.push("/dashboard/tourist"), 8000);
    return () => clearTimeout(t);
  }, [state, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">

        {/* ── Verifying ── */}
        {state === "verifying" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
            <p className="font-medium text-slate-700">Confirming your payment…</p>
            <p className="text-sm text-slate-400">Please don&apos;t close this tab.</p>
          </div>
        )}

        {/* ── Success ── */}
        {state === "success" && (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Payment Successful! 🎉
            </h1>
            <p className="mt-2 text-slate-500">
              Your booking has been confirmed. Get ready for an amazing
              adventure!
            </p>

            <p className="mt-4 text-xs text-slate-400">
              Redirecting to your bookings in a few seconds…
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/dashboard/tourist">
                <Button className="w-full sm:w-auto gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  My Bookings
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* ── Error ── */}
        {state === "error" && (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
            </div>

            <h1 className="text-xl font-bold text-slate-800">
              Verification Problem
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {errorMsg || "We couldn't confirm your payment automatically."}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              If you were charged, your booking will be updated shortly. Check
              your bookings page.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/dashboard/tourist">
                <Button className="w-full sm:w-auto gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Check My Bookings
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page wrapper with Suspense (required by Next.js for useSearchParams) ─────

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
