"use client";

import Link from "next/link";
import { Sparkles, TriangleAlert } from "lucide-react";

import { useSchoolStore } from "@/stores/school-store";
import { useAccessStatus } from "../hooks/use-access-status";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardContextHeader() {
  const school = useSchoolStore((s) => s.currentSchool);
  const access = useAccessStatus();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {greeting()}, {school?.name ?? "your school"} 👋
        </h1>
      </div>

      {access?.isTrialing && (
        <Link
          href="/settings/subscription"
          className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-primary/20"
        >
          <Sparkles className="size-3.5 text-primary" />
          {access.daysLeft === null
            ? "On trial"
            : access.daysLeft === 0
              ? "Trial ends today"
              : `Trial: ${access.daysLeft} day${access.daysLeft === 1 ? "" : "s"} left`}
          <span className="text-primary underline underline-offset-2">Upgrade</span>
        </Link>
      )}

      {/* An expired school can't write anything — registers, scores and
          payments all refuse. Saying so here, where it's unmissable, beats
          letting them discover it one failed save at a time. */}
      {access?.isExpired && (
        <Link
          href="/settings/subscription"
          className="flex items-center gap-2 rounded-full border border-clay/40 bg-clay/10 px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-clay/20"
        >
          <TriangleAlert className="size-3.5 text-clay" />
          Access expired
          <span className="text-clay underline underline-offset-2">Renew</span>
        </Link>
      )}
    </div>
  );
}
