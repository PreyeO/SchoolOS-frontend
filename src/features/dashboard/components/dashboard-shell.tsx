"use client";

import { useState, type CSSProperties } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { RouteAccessGuard } from "@/components/auth/route-access-guard";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import { PortalContainerProvider } from "@/components/ui/portal-container";
import { pickReadableForeground } from "@/lib/contrast";
import { useSchoolStore } from "@/stores/school-store";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { MobileTabBar } from "./mobile-tab-bar";
import { useMobileTabs } from "../hooks/use-mobile-tabs";
import { useSyncSchoolData } from "../hooks/use-sync-school-data";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  // The phone nav drawer. Shared by the topbar's hamburger and the bottom
  // bar's "More" tab, so both open the one menu.
  const [menuOpen, setMenuOpen] = useState(false);
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);
  // Parents and teachers get a bottom bar on phones; [] for everyone else.
  const tabs = useMobileTabs();
  useSyncSchoolData();
  const primaryColor = useSchoolStore((s) => s.currentSchool?.primaryColor);
  const accentColor = useSchoolStore((s) => s.currentSchool?.accentColor);

  // The school's own colors drive the sidebar background (primary_color) and
  // its accents — active item, focus rings, trial badge (accent_color); each
  // is omitted when unset so CSS falls back to the SchoolOS pine/amber
  // palette. The paired -fg variable picks readable text for whichever exact
  // color the school chose, so an unusually light/dark pick can't produce
  // illegible text.
  const shellStyle: CSSProperties = {
    ...(primaryColor
      ? { "--shell-primary": primaryColor, "--shell-primary-fg": pickReadableForeground(primaryColor) }
      : {}),
    ...(accentColor
      ? { "--shell-accent": accentColor, "--shell-accent-fg": pickReadableForeground(accentColor) }
      : {}),
  } as CSSProperties;

  return (
    <AuthGuard>
      <ServiceWorkerProvider />
      <PortalContainerProvider value={shellEl}>
        <div ref={setShellEl} data-dashboard-shell className="flex min-h-screen bg-background" style={shellStyle}>
          <AppSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
          <div className="flex flex-1 flex-col min-w-0">
            <AppTopbar open={menuOpen} setOpen={setMenuOpen} />
            {/* With a bottom bar, the page needs room beneath it (bar ~56px +
                breathing space) or its last row sits under the bar. lg and up
                have no bar, so the usual padding returns there. */}
            <main className={`flex-1 px-4 pt-6 lg:px-8 lg:py-8 ${tabs.length > 0 ? "pb-24" : "pb-6"}`}>
              {/* Inside the shell, not around it: someone who lands on a page
                  that isn't theirs still needs the sidebar to get somewhere
                  that is. */}
              <div className="mx-auto max-w-6xl">
                <RouteAccessGuard>{children}</RouteAccessGuard>
              </div>
            </main>
          </div>
          {tabs.length > 0 && <MobileTabBar tabs={tabs} onOpenMore={() => setMenuOpen(true)} />}
        </div>
      </PortalContainerProvider>
    </AuthGuard>
  );
}
