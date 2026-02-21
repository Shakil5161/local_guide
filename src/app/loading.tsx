import { PageLoader } from "@/components/shared/page-loader";

/**
 * Next.js root loading.tsx
 * Automatically shown during route transitions / page suspense.
 */
export default function RootLoading() {
  return <PageLoader size="lg" message="Loading page…" />;
}
