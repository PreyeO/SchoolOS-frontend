"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StepKey } from "@/lib/school/onboarding-steps";
import type { OnboardingReviewResponse } from "../types";
import { BrandingSummary } from "./summaries/branding-summary";
import { SessionSummary } from "./summaries/session-summary";
import { ClassesSummary } from "./summaries/classes-summary";
import { SubjectsSummary } from "./summaries/subjects-summary";

interface Props {
  step: StepKey;
  review: OnboardingReviewResponse | undefined;
  onBack?: () => void;
  onContinue: () => void;
}

export function CompletedStepView({ step, review, onBack, onContinue }: Props) {
  const session = review?.academic_sessions[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 rounded-lg bg-grass/10 px-3.5 py-2.5 border border-grass/20 text-sm text-ink">
        <CheckCircle2 className="size-4 text-grass shrink-0" />
        This step is complete. You can update it later from dashboard Settings.
      </div>

      <div className="rounded-xl border border-n-200 p-4">
        {!review ? (
          <p className="text-sm text-n-400" role="status">Loading…</p>
        ) : step === "branding" ? (
          <BrandingSummary school={review.school} />
        ) : step === "academic_year" ? (
          session ? <SessionSummary session={session} /> : <p className="text-sm text-n-400 italic">Skipped.</p>
        ) : step === "classes" ? (
          <ClassesSummary classes={review.classes} />
        ) : (
          <SubjectsSummary subjects={review.subjects} />
        )}
      </div>

      <div className="flex gap-3">
        {onBack && <Button type="button" variant="outline" onClick={onBack}>Back</Button>}
        <Button type="button" onClick={onContinue} className="flex-1 bg-amber hover:bg-amber/90 text-ink font-semibold">
          Continue
        </Button>
      </div>
    </div>
  );
}
