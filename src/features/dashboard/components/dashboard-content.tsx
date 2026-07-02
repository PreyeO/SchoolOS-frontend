"use client";

import { useAuthStore } from "@/stores/auth-store";

import { DashboardWelcome } from "./dashboard-welcome";
import { SetupChecklist } from "./setup-checklist";

const ROLE_LABELS: Record<string, string> = {
  teacher: "teacher",
  parent: "parent",
  student: "student",
};

export function DashboardContent() {
  const personas = useAuthStore((s) => s.claims?.personas) ?? [];

  // Admins (and the school owner, whose claims aren't set post-create-school) get
  // the full Phase 4 shell. Other personas get a placeholder until their phase lands.
  const isAdmin = personas.length === 0 || personas.includes("admin");

  if (isAdmin) {
    return (
      <div className="space-y-6 max-w-5xl">
        <DashboardWelcome />
        <SetupChecklist />
      </div>
    );
  }

  const role = personas.map((p) => ROLE_LABELS[p]).find(Boolean) ?? "role";

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold text-ink">You&apos;re all set 🎉</h1>
        <p className="mt-2 text-n-500 leading-relaxed">
          Your {role} dashboard is coming soon. We&apos;ll let you know the moment it&apos;s ready.
        </p>
      </div>
    </div>
  );
}
