"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await register({
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
        role: String(formData.get("role") || "TOURIST") as "TOURIST" | "GUIDE",
        name: String(formData.get("name") || ""),
        phone: String(formData.get("phone") || ""),
        city: String(formData.get("city") || ""),
        country: String(formData.get("country") || ""),
      });
      router.push("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input name="name" required placeholder="Full name" className="w-full rounded-md border px-3 py-2" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-md border px-3 py-2" />
        <input name="password" type="password" required placeholder="Password" className="w-full rounded-md border px-3 py-2" />
        <select name="role" defaultValue="TOURIST" className="w-full rounded-md border px-3 py-2">
          <option value="TOURIST">Tourist</option>
          <option value="GUIDE">Guide</option>
        </select>
        <input name="phone" placeholder="Phone" className="w-full rounded-md border px-3 py-2" />
        <input name="city" placeholder="City" className="w-full rounded-md border px-3 py-2" />
        <input name="country" placeholder="Country" className="w-full rounded-md border px-3 py-2" />

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-sky-600 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
    </div>
  );
}
