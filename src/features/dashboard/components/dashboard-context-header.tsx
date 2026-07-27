"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { useSchoolStore } from "@/stores/school-store";
import { useTrialStatus } from "../hooks/use-overview-stats";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardContextHeader() {
  const school = useSchoolStore((s) => s.currentSchool);
  const { data: trial } = useTrialStatus();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {greeting()}, {school?.name ?? "your school"} 👋
        </h1>
      </div>

      {trial?.isTrialing && (
        <Link
          href="/settings/subscription"
          className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-primary/20 transition-colors"
        >
          <Sparkles className="size-3.5 text-primary" />
          Trial: {trial.daysLeft} days left
          <span className="text-primary underline underline-offset-2">Upgrade</span>
        </Link>
      )}
    </div>
  );
}
