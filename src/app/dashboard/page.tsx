"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardIndexPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "TOURIST") router.replace("/dashboard/tourist");
    if (user.role === "GUIDE") router.replace("/dashboard/guide");
    if (user.role === "ADMIN") router.replace("/dashboard/admin");
  }, [loading, router, user]);

  return <div className="px-4 py-10 text-sm text-slate-600">Redirecting...</div>;
}
