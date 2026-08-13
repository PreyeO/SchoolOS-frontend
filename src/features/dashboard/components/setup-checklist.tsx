"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown, Circle, PartyPopper, X } from "lucide-react";

import { canDoOnboarding } from "@/lib/auth/can-do-onboarding";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStage } from "@/features/onboarding/hooks/use-onboarding-stage";

import { useChecklistDismissed } from "../hooks/use-checklist-dismissed";
import { useSetupStatus } from "../hooks/use-setup-status";
import { SETUP_STAGES, type SetupStep, type SetupStepKey } from "../lib/setup-steps";

export function SetupChecklist() {
  const claims = useAuthStore((s) => s.claims);
  const { setupStatus, completedCount, totalSteps, isComplete, canTakeRegister, currentSchool } =
    useSetupStatus();
  const { data: stage } = useOnboardingStage();
  const { dismissed, dismiss } = useChecklistDismissed(currentSchool?.id);

  // Opens on the first stage that still has work, so the card lands on what to
  // do next rather than on whatever happens to be first.
  const firstIncomplete = SETUP_STAGES.find((s) => s.steps.some((step) => !setupStatus[step.key]));
  const [openStage, setOpenStage] = useState<string | null>(firstIncomplete?.label ?? null);
  const [expanded, setExpanded] = useState(true);

  // Onboarding is owner-only (IsSchoolOwner enforces this server-side) — other
  // admins and personas never see this card.
  if (!canDoOnboarding(claims)) return null;
  if (dismissed) return null;

  // Until the wizard itself is finished, every item resumes it there — doing the
  // same step via a Settings page would never advance onboarding_progress,
  // leaving the wizard out of sync with what the owner actually did.
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
          className="text-n-400 transition-colors hover:text-ink"
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
        aria-expanded={expanded}
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
          <p className="text-sm font-semibold text-ink">Getting started</p>
          <p className="mt-0.5 text-xs text-n-500">
            {completedCount} of {totalSteps} done
            {/* The milestone that matters, called out separately from raw
                progress: it's the first point the product does something. */}
            {canTakeRegister
              ? " · ready to take registers"
              : " · a few more before you can take a register"}
          </p>
        </div>
        <ChevronDown className={cn("size-4 text-n-400 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="space-y-1 px-2 pb-3">
          {SETUP_STAGES.map((group) => {
            const done = group.steps.filter((s) => setupStatus[s.key]).length;
            const stageComplete = done === group.steps.length;
            const isOpen = openStage === group.label;

            return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() => setOpenStage(isOpen ? null : group.label)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-n-50"
                >
                  {stageComplete ? (
                    <CheckCircle2 className="size-4 shrink-0 text-grass" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-n-300" />
                  )}
                  <span className={cn("text-sm font-medium", stageComplete ? "text-n-400" : "text-ink")}>
                    {group.label}
                  </span>
                  <span className="text-xs text-n-400">
                    {done}/{group.steps.length}
                  </span>
                  <ChevronDown
                    className={cn(
                      "ml-auto size-3.5 text-n-400 transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>

                {isOpen && (
                  <ul className="space-y-0.5 pb-1 pl-8 pr-2">
                    {group.steps.map((step) => (
                      <StepRow
                        key={step.key}
                        step={step}
                        done={setupStatus[step.key]}
                        wizardUnfinished={wizardUnfinished}
                      />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepRow({
  step,
  done,
  wizardUnfinished,
}: {
  step: SetupStep;
  done: boolean;
  wizardUnfinished: boolean;
}) {
  if (done) {
    return (
      <li className="flex items-center gap-2 py-1">
        <CheckCircle2 className="size-3.5 shrink-0 text-grass" />
        <span className="text-sm text-n-400 line-through">{step.label}</span>
      </li>
    );
  }

  return (
    <li className="py-1.5">
      <div className="flex items-start gap-2">
        <Circle className="mt-0.5 size-3.5 shrink-0 text-n-300" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink">{step.label}</p>
          {/* Why it matters, not a restatement of the label — this is where the
              admin learns the model instead of discovering it via a 400. */}
          <p className="mt-0.5 text-xs text-n-400">{step.consequence}</p>
          <Link
            href={wizardUnfinished ? "/onboarding" : step.href}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {wizardUnfinished ? "Continue setup" : step.cta}
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </li>
  );
}

export type { SetupStepKey };
