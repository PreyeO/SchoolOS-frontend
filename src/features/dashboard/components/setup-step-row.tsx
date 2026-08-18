"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

import { resolveStepText, type SetupStep } from "../lib/setup-steps";
import type { TeachingUnitWords } from "@/lib/school/teaching-unit";

interface Props {
  step: SetupStep;
  done: boolean;
  // Set only for steps completed per-item, so partial work is visible.
  progress?: { done: number; total: number };
  unitWords: TeachingUnitWords;
  wizardUnfinished: boolean;
}

export function SetupStepRow({ step, done, progress, unitWords, wizardUnfinished }: Props) {
  const label = resolveStepText(step.label, unitWords);

  if (done) {
    return (
      <li className="flex items-center gap-2 py-1">
        <CheckCircle2 className="size-3.5 shrink-0 text-grass" />
        <span className="text-sm text-n-400 line-through">{label}</span>
      </li>
    );
  }

  return (
    <li className="py-1.5">
      <div className="flex items-start gap-2">
        <Circle className="mt-0.5 size-3.5 shrink-0 text-n-300" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink">
            {label}
            {progress && progress.total > 0 && (
              <span className="ml-1.5 text-xs text-n-400">
                {progress.done} of {progress.total}
              </span>
            )}
          </p>
          {/* Why it matters, not a restatement of the label — this is where the
              admin learns the model instead of discovering it via a 400. */}
          <p className="mt-0.5 text-xs text-n-400">{resolveStepText(step.consequence, unitWords)}</p>
          {/* Routed to /onboarding while the wizard is unfinished: letting them
              complete the same data from a Settings page would leave
              onboarding_progress.current_step behind and desync the resume
              position. */}
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
