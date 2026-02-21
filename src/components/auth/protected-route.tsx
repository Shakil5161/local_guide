"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { UserRole } from "@/types/auth";
import { PageLoader } from "@/components/shared/page-loader";

type Props = {
  children: React.ReactNode;
  allow?: UserRole[];
};

export const ProtectedRoute = ({ children, allow }: Props) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (allow && !allow.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [allow, user, loading, router]);

  if (loading || !user) {
    return <PageLoader message="Checking authentication…" />;
  }

  if (allow && !allow.includes(user.role)) {
    return <PageLoader message="Redirecting…" />;
  }

  return <>{children}</>;
};
