"use client";

import { useState, type CSSProperties } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useSchoolStore } from "@/stores/school-store";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const primaryColor = useSchoolStore((s) => s.currentSchool?.primaryColor);
  const accentColor = useSchoolStore((s) => s.currentSchool?.accentColor);

  // The school's own colors drive --primary/--accent shell-wide (sidebar
  // accent, active states, chart/KPI accents); each is omitted when unset so
  // CSS falls back to the SchoolOS pine/amber palette.
  const shellStyle: CSSProperties = {
    ...(primaryColor ? { "--shell-primary": primaryColor } : {}),
    ...(accentColor ? { "--shell-accent": accentColor } : {}),
  } as CSSProperties;

  return (
    <AuthGuard>
      <div data-dashboard-shell className="flex min-h-screen bg-background" style={shellStyle}>
        <AppSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        <div className="flex flex-1 flex-col min-w-0">
          <AppTopbar />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
