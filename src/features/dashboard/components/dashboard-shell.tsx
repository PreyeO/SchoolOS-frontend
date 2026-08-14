"use client";

import { useState, type CSSProperties } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import { PortalContainerProvider } from "@/components/ui/portal-container";
import { pickReadableForeground } from "@/lib/contrast";
import { useSchoolStore } from "@/stores/school-store";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { useSyncSchoolData } from "../hooks/use-sync-school-data";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);
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
            <AppTopbar />
            <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
              <div className="mx-auto max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </PortalContainerProvider>
    </AuthGuard>
  );
}
