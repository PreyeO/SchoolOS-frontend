import type { Metadata } from "next";

import { AuthHandoffView } from "@/features/auth/components/auth-handoff-view";

export const metadata: Metadata = {
  title: "Signing in",
  robots: { index: false, follow: false },
};

// Top-level route, outside (auth) and (dashboard): it must render with no shell
// and no AuthGuard. A guard would bounce it to /login before it could store the
// session it exists to store.
export default function Page() {
  return <AuthHandoffView />;
}
