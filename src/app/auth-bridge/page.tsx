import type { Metadata } from "next";

import { AuthBridgeView } from "@/features/auth/components/auth-bridge-view";

// Deliberately not indexed: this is machinery, not a page. It exists only to be
// loaded in a hidden iframe by the apex during login.
export const metadata: Metadata = {
  title: "Signing in",
  robots: { index: false, follow: false },
};

// Top-level route rather than inside (auth) or (dashboard): it must render with
// no shell, no navbar and no AuthGuard — a guard would redirect it to /login
// before it could receive the session it exists to receive.
export default function Page() {
  return <AuthBridgeView />;
}
