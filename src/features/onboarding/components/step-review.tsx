"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCompleteOnboarding } from "../hooks/use-complete-onboarding";
import { useOnboardingReview } from "../hooks/use-onboarding-review";
import { BrandingReviewSection } from "./review/branding-review-section";
import { SessionReviewSection } from "./review/session-review-section";
import { ClassesReviewSection } from "./review/classes-review-section";
import { SubjectsReviewSection } from "./review/subjects-review-section";

interface Props {
  onBack: () => void;
}

export function StepReview({ onBack }: Props) {
  const { data: review, isPending } = useOnboardingReview();
  const { mutate, isPending: isFinishing } = useCompleteOnboarding();

  if (isPending || !review) {
    return <p className="text-sm text-n-400" role="status">Loading your setup…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl bg-grass/10 px-4 py-3 border border-grass/20">
        <CheckCircle2 className="size-5 text-grass shrink-0" />
        <p className="text-sm text-ink font-medium">Here&rsquo;s everything you&rsquo;ve set up so far.</p>
      </div>

      <BrandingReviewSection school={review.school} />
      <SessionReviewSection session={review.academic_sessions[0]} />
      <ClassesReviewSection classes={review.classes} />
      <SubjectsReviewSection subjects={review.subjects} schoolLevels={review.school.levels} />

      <p className="text-xs text-n-400">
        Edits here save immediately. Finish setup once everything looks right.
      </p>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button
          type="button"
          disabled={isFinishing}
          onClick={() => mutate()}
          className="flex-1 bg-amber hover:bg-amber/90 text-ink font-semibold"
        >
          {isFinishing ? "Finishing up…" : "Finish setup"}
        </Button>
      </div>
    </div>
  );
}
