import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Local Guide team. We're here to help with any questions about tours, bookings, or becoming a local guide.",
  keywords: ["contact", "support", "local guide", "help"],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
