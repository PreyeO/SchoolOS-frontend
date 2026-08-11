"use client";

import { GraduationCap, Users2, Wallet, type LucideIcon } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { TeacherHome } from "@/features/teacher/components/teacher-home";
import { ParentHome } from "@/features/parent/components/parent-home";
import { StudentHome } from "@/features/student/components/student-home";
import { PersonaPlaceholder } from "./persona-placeholder";
import { DashboardContextHeader } from "./dashboard-context-header";
import { SetupChecklist } from "./setup-checklist";
import { KpiCards } from "./kpi-cards";
import { QuickActions } from "./quick-actions";
import { OverviewCharts } from "./overview-charts";
import { ActivityFeed } from "./activity-feed";
import { UpcomingEvents } from "./upcoming-events";

const PERSONA_HOMES: Record<string, { title: string; description: string; icon: LucideIcon; upcoming: string[] }> = {
  parent: {
    title: "Welcome",
    description: "Your parent portal is being built.",
    icon: Users2,
    upcoming: [
      "See your child's attendance and results",
      "Get notified about absences and announcements",
      "View and pay fees online",
      "Message your child's teachers",
    ],
  },
  student: {
    title: "Welcome",
    description: "Your student portal is being built.",
    icon: GraduationCap,
    upcoming: [
      "Check your timetable and assignments",
      "See your results and attendance record",
      "Access learning materials shared by your teachers",
    ],
  },
  bursar: {
    title: "Welcome",
    description: "Your bursar workspace is being built.",
    icon: Wallet,
    upcoming: [
      "Record and reconcile fee payments",
      "Track outstanding balances by class",
      "Manage expenses and payroll",
      "Produce financial reports",
    ],
  },
};

export function DashboardHome() {
  const personas = useAuthStore((s) => s.claims?.personas) ?? [];

  // Admins (and the school owner, whose claims aren't set post-create-school) get
  // the full premium overview. Checked first: someone who is both an admin and a
  // teacher manages the school here and uses the teacher screens directly.
  const isAdmin = personas.length === 0 || personas.includes("admin");

  if (!isAdmin && personas.includes("teacher")) {
    return <TeacherHome />;
  }

  if (!isAdmin && personas.includes("parent")) {
    return <ParentHome />;
  }

  if (!isAdmin && personas.includes("student")) {
    return <StudentHome />;
  }

  if (!isAdmin) {
    const home = personas.map((p) => PERSONA_HOMES[p]).find(Boolean);
    if (home) return <PersonaPlaceholder {...home} />;

    // No recognised persona at all — an account with a membership but no role.
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-bold text-ink">No role assigned</h1>
          <p className="mt-2 leading-relaxed text-n-500">
            Your account doesn&apos;t have a role at this school yet. Ask an
            administrator to grant you access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardContextHeader />
      <SetupChecklist />
      <KpiCards />
      <QuickActions />
      <OverviewCharts />
      <div className="grid lg:grid-cols-2 gap-4">
        <ActivityFeed />
        <UpcomingEvents />
      </div>
    </div>
  );
}
