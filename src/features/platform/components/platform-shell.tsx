"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { PortalContainerProvider } from "@/components/ui/portal-container";
import { useAuthStore } from "@/stores/auth-store";

import { PlatformSidebar } from "./platform-sidebar";
import { PlatformTopbar } from "./platform-topbar";

// SchoolOS staff console.
//
// A sibling of DashboardShell, not a variant of it. A platform admin's token
// carries no school_id and no membership_id, /auth/me/ 403s for them, and the
// school shell's sidebar would fall back to the full school-admin nav — so
// almost nothing in that shell applies. What IS shared (AuthGuard, the portal
// container, the sidebar sub-components) is imported rather than duplicated.
//
// Deliberately omits ServiceWorkerProvider: the service worker exists for the
// offline attendance cache, which no platform screen has any use for.
//
// No --shell-* CSS vars are set. Every consumer reads them as
// var(name, fallback), so they resolve to the fixed SchoolOS palette — the
// correct look for a console that belongs to no school.
export function PlatformShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);

  return (
    <AuthGuard>
      <PlatformGuard>
        <PortalContainerProvider value={shellEl}>
          <div ref={setShellEl} data-dashboard-shell className="flex min-h-screen bg-background">
            <PlatformSidebar
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed((c) => !c)}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <PlatformTopbar />
              <main className="flex-1 px-4 py-6 sm:px-6">
                <div className="mx-auto max-w-6xl">{children}</div>
              </main>
            </div>
          </div>
        </PortalContainerProvider>
      </PlatformGuard>
    </AuthGuard>
  );
}

// AuthGuard only proves there's a token — it says nothing about who holds it.
// Without this, a signed-in school admin could open /platform/* and see the
// console chrome, then watch every request 403. Bounces them to their own
// dashboard instead.
//
// Renders nothing rather than a message while redirecting: this is a wrong
// turn, not a permission refusal worth explaining.
function PlatformGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const claims = useAuthStore((s) => s.claims);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isPlatformAdmin = claims?.is_platform_admin === true;

  useEffect(() => {
    if (hasHydrated && !isPlatformAdmin) router.replace("/dashboard");
  }, [hasHydrated, isPlatformAdmin, router]);

  if (!hasHydrated || !isPlatformAdmin) return null;
  return <>{children}</>;
}
