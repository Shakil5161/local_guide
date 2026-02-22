"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  Briefcase,
  Loader2,
} from "lucide-react";

// ─── Contact reasons ──────────────────────────────────────────────────────────

const REASONS = [
  { value: "general", label: "General Inquiry" },
  { value: "guide", label: "Becoming a Guide" },
  { value: "booking", label: "Booking Support" },
  { value: "payment", label: "Payment Issue" },
  { value: "report", label: "Report a Problem" },
  { value: "partnership", label: "Partnership / Business" },
];

const INFO = [
  {
    icon: Mail,
    label: "Email Us",
    value: "hello@localguide.com",
    sub: "We reply within 24 hours",
    color: "bg-sky-50 text-sky-600 ring-sky-100",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+880 1700-000000",
    sub: "Sun – Thu, 9 AM – 6 PM",
    color: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  {
    icon: MapPin,
    label: "Our Office",
    value: "Gulshan-2, Dhaka, Bangladesh",
    sub: "Drop by for a coffee ☕",
    color: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Sun – Thu: 9 AM – 6 PM",
    sub: "Fri & Sat: Closed",
    color: "bg-amber-50 text-amber-500 ring-amber-100",
  },
];

const QUICK_LINKS = [
  { icon: HelpCircle, label: "Check our FAQ", href: "/faq" },
  { icon: MessageSquare, label: "Browse tours", href: "/explore" },
  { icon: Briefcase, label: "Become a guide", href: "/register" },
];

const fieldCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    reason: "general",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    // Simulate a network delay (no real endpoint needed for a static contact form)
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    toast.success("Message sent! We'll get back to you within 24 hours. 🎉");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-900 via-sky-900 to-indigo-900 px-4 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
            Get In Touch
          </p>
          <h1 className="mt-3 text-4xl font-bold">We&apos;d love to hear from you</h1>
          <p className="mt-4 text-lg text-slate-300">
            Whether you have a question, a problem to report, or just want to
            say hello — our team is here for you.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ── Left: Info + Quick links ── */}
          <div className="space-y-5">
            {/* Contact info cards */}
            {INFO.map((item) => (
              <div
                key={item.label}
                className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className={`mt-0.5 shrink-0 rounded-xl p-2 ring-1 ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {item.value}
                  </p>
                  <p className="text-xs text-slate-400">{item.sub}</p>
                </div>
              </div>
            ))}

            {/* Quick links */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-700">
                Before you write…
              </h3>
              <div className="space-y-2">
                {QUICK_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
                  >
                    <l.icon className="h-4 w-4 text-sky-500" />
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              {sent ? (
                /* Success state */
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="rounded-full bg-emerald-50 p-5 ring-4 ring-emerald-100">
                    <span className="text-5xl">✅</span>
                  </div>
                  <h2 className="mt-5 text-2xl font-bold text-slate-800">
                    Message Received!
                  </h2>
                  <p className="mt-2 max-w-sm text-slate-500">
                    Thanks for reaching out,{" "}
                    <span className="font-semibold text-slate-700">{form.name}</span>!
                    We&apos;ll reply to{" "}
                    <span className="font-semibold text-slate-700">{form.email}</span>{" "}
                    within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", reason: "general", message: "" }); }}
                    className="mt-6 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Send us a message
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Fill in the form and we&apos;ll get back to you shortly.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        className={fieldCls}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        className={fieldCls}
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      What&apos;s this about?
                    </label>
                    <select
                      className={fieldCls}
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                    >
                      {REASONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      className={`${fieldCls} min-h-[130px] resize-y`}
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help…"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white shadow-md shadow-sky-600/20 transition hover:bg-sky-700 disabled:opacity-60"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {sending ? "Sending…" : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
