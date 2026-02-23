import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Find answers to common questions about booking tours, working as a guide, payments, cancellations, and more on Local Guide.",
  keywords: ["faq", "help", "booking", "local guide", "questions"],
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
