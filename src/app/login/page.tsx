"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const toastId = toast.loading("Signing in...");

    try {
      await login(email, password);
      toast.success("Welcome back! 🎉", { id: toastId });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Invalid email or password";
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 pb-2 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
            <LogIn className="h-7 w-7 text-sky-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Welcome back
          </CardTitle>
          <p className="text-sm text-slate-500">
            Sign in to your Local Guide account
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <Input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="h-11"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>
              <Input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-sky-600 hover:underline"
            >
              Create one free
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
