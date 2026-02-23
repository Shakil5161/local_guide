import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join Local Guide as a tourist or become a verified local guide and start earning by sharing your city.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
