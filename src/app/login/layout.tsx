import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Local Guide account to manage bookings, reviews, and more.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
