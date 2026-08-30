import type { Metadata } from "next";

import { BookDemoView } from "@/features/pilot/components/book-demo-view";

export const metadata: Metadata = {
  title: "Join the pilot",
  description:
    "We're onboarding a small number of Nigerian schools for a free pilot this term. Full access, set up with you, no cost.",
};

// Server component wrapping the client form, and inside the (marketing) group
// so it inherits the Navbar and Footer rather than the dashboard shell. Public:
// no AuthGuard, and the submission carries no token.
export default function Page() {
  return <BookDemoView />;
}
