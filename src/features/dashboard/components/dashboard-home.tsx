"use client";

import { useActivePersona } from "@/lib/auth/use-active-persona";
import { TeacherHome } from "@/features/teacher/components/teacher-home";
import { ParentHome } from "@/features/parent/components/parent-home";
import { StudentHome } from "@/features/student/components/student-home";
import { DashboardContextHeader } from "./dashboard-context-header";
import { SetupChecklist } from "./setup-checklist";
import { KpiCards } from "./kpi-cards";
import { QuickActions } from "./quick-actions";
import { ResultsProgressCard } from "./results-progress-card";
import { OverviewCharts } from "./overview-charts";
import { ActivityFeed } from "./activity-feed";
import { RecentAnnouncements } from "./recent-announcements";

// The home for whichever persona the member is working as. Someone who is both
// an admin and a teacher used to always land on the admin overview, because
// admin was checked first; they now get the home of the profile they chose,
// and switch from the user menu.
export function DashboardHome() {
  const persona = useActivePersona();

  if (persona === "teacher") return <TeacherHome />;
  if (persona === "parent") return <ParentHome />;
  if (persona === "student") return <StudentHome />;

  // Admin — including the school owner, and the "admin" fallback
  // useActivePersona gives an owner whose personas aren't known yet.
  return (
    <div className="space-y-6">
      <DashboardContextHeader />
      <SetupChecklist />
      <KpiCards />
      <QuickActions />
      <ResultsProgressCard />
      <OverviewCharts />
      <div className="grid lg:grid-cols-2 gap-4">
        <ActivityFeed />
        <RecentAnnouncements />
      </div>
    </div>
  );
}
