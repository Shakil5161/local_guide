"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"TOURIST" | "GUIDE">("TOURIST");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const toastId = toast.loading("Creating your account...");

    try {
      await register({
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
        role,
        name: String(formData.get("name") || ""),
        phone: String(formData.get("phone") || "") || undefined,
        city: String(formData.get("city") || "") || undefined,
        country: String(formData.get("country") || "") || undefined,
      });
      toast.success("Account created! Welcome to Local Guide 🌍", {
        id: toastId,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Registration failed. Please try again.";
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
            <UserPlus className="h-7 w-7 text-sky-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Create your account
          </CardTitle>
          <p className="text-sm text-slate-500">
            Join thousands of travelers and guides
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Role Switcher */}
          <div className="mb-5 flex rounded-lg border border-slate-200 p-1">
            {(["TOURIST", "GUIDE"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                  role === r
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r === "TOURIST" ? "🧳 Tourist" : "🗺️ Guide"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Full Name
              </label>
              <Input name="name" required placeholder="John Doe" className="h-11" />
            </div>

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
                placeholder="Min. 8 characters"
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  City
                </label>
                <Input name="city" placeholder="New York" className="h-11" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Country
                </label>
                <Input name="country" placeholder="USA" className="h-11" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Phone <span className="text-slate-400">(optional)</span>
              </label>
              <Input
                name="phone"
                placeholder="+1 234 567 890"
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                `Create ${role === "TOURIST" ? "Tourist" : "Guide"} Account`
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-sky-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
