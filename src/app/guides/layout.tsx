import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Local Guides",
  description:
    "Discover experienced local guides from cities around the world. Filter by city and language to find your perfect guide.",
  keywords: ["local guides", "travel guide", "tour guide", "find guide"],
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
