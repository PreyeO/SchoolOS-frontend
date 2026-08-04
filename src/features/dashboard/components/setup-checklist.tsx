"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, Circle, PartyPopper, X } from "lucide-react";

import { canDoOnboarding } from "@/lib/auth/can-do-onboarding";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStage } from "@/features/onboarding/hooks/use-onboarding-stage";

import { useChecklistDismissed } from "../hooks/use-checklist-dismissed";
import { useSetupStatus } from "../hooks/use-setup-status";

const CHECKLIST_ITEMS = [
  { label: "Set up school branding", key: "branding" as const, href: "/settings/school" },
  { label: "Create academic year", key: "academic_year" as const, href: "/settings/sessions" },
  { label: "Add your classes", key: "classes" as const, href: "/classes" },
  { label: "Choose subjects", key: "subjects" as const, href: "/subjects" },
];

export function SetupChecklist() {
  const claims = useAuthStore((s) => s.claims);
  const { setupStatus, isComplete, completedCount, totalSteps, currentSchool } = useSetupStatus();
  const { data: stage } = useOnboardingStage();
  const { dismissed, dismiss } = useChecklistDismissed(currentSchool?.id);
  const [expanded, setExpanded] = useState(true);

  // Onboarding is owner-only (accounts/permissions.py's IsSchoolOwner enforces
  // this server-side) — other admins/personas never see this card at all.
  if (!canDoOnboarding(claims)) return null;
  if (dismissed) return null;

  // Until the wizard itself is finished, every item must resume it there —
  // completing the same step via a Settings page instead would never touch
  // onboarding_progress.current_step, leaving the wizard's own progress out
  // of sync with what the owner actually did. Defaults to "unfinished" while
  // the stage is still loading, since that's the safe direction to guess.
  const wizardUnfinished = stage?.is_completed !== true;

  const pct = Math.round((completedCount / totalSteps) * 100);

  if (isComplete) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
        <PartyPopper className="size-5 shrink-0 text-primary" />
        <p className="flex-1 text-sm font-medium text-ink">
          Your school is fully set up — nice work!
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-n-400 hover:text-ink transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-n-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-4 px-4 py-3.5"
      >
        <div className="relative size-11 shrink-0">
          <svg viewBox="0 0 36 36" className="size-11 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--n-100)" strokeWidth="3.5" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke="var(--shell-primary, var(--brand))" strokeWidth="3.5"
              strokeDasharray={`${pct * 0.942} 94.2`}
              strokeLinecap="round"
              className="transition-[stroke-dasharray] duration-500 ease-out"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-ink">
            {pct}%
          </span>
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-ink">Finish setting up your school</p>
          <p className="text-xs text-n-500 mt-0.5">{completedCount} of {totalSteps} steps done</p>
        </div>
        <ChevronDown className={cn("size-4 text-n-400 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <ul className="space-y-1 px-4 pb-4">
          {CHECKLIST_ITEMS.map((item) => {
            const done = setupStatus[item.key];
            return (
              <li key={item.key}>
                <Link
                  href={wizardUnfinished ? "/onboarding" : item.href}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-n-50 transition-colors"
                >
                  {done
                    ? <CheckCircle2 className="size-4 shrink-0 text-grass" />
                    : <Circle className="size-4 shrink-0 text-n-300" />}
                  <span className={cn("text-sm", done ? "text-n-400 line-through" : "text-ink")}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
