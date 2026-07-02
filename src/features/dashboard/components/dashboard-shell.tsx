"use client";

import { useState, type CSSProperties } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useSchoolStore } from "@/stores/school-store";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const primaryColor = useSchoolStore((s) => s.currentSchool?.primaryColor);

  // The school's brand color drives --primary shell-wide (sidebar accent, active
  // states, chart/KPI accents); omitted when unset so CSS falls back to pine/amber.
  const shellStyle = primaryColor
    ? ({ "--shell-accent": primaryColor } as CSSProperties)
    : undefined;

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
