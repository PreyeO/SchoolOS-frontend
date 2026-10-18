import type { Metadata } from "next";

import { CheckResultPage } from "@/features/scratch-cards/components/check-result-page";

export const metadata: Metadata = {
  title: "Check a result",
  description: "Check your child's school result with the scratch card from their school. No account needed.",
};

// Public: no AuthGuard and no token (client.ts keeps any stored one off these
// calls). In the marketing group for the Navbar and Footer. Works on the apex
// and on any school's subdomain alike — proxy.ts only routes "/".
export default function Page() {
  return <CheckResultPage />;
}
