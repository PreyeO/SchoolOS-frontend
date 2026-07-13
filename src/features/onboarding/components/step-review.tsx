"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCompleteOnboarding } from "../hooks/use-complete-onboarding";
import { useOnboardingReview } from "../hooks/use-onboarding-review";
import { BrandingSummary } from "./summaries/branding-summary";
import { SessionSummary } from "./summaries/session-summary";
import { ClassesSummary } from "./summaries/classes-summary";
import { SubjectsSummary } from "./summaries/subjects-summary";

interface Props {
  onBack: () => void;
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-n-200 p-4 space-y-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-n-400">{title}</p>
      {children}
    </div>
  );
}

export function StepReview({ onBack }: Props) {
  const { data: review, isPending } = useOnboardingReview();
  const { mutate, isPending: isFinishing } = useCompleteOnboarding();

  if (isPending || !review) {
    return <p className="text-sm text-n-400" role="status">Loading your setup…</p>;
  }

  const session = review.academic_sessions[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl bg-grass/10 px-4 py-3 border border-grass/20">
        <CheckCircle2 className="size-5 text-grass shrink-0" />
        <p className="text-sm text-ink font-medium">Here&rsquo;s everything you&rsquo;ve set up so far.</p>
      </div>

      <ReviewSection title="Branding">
        <BrandingSummary school={review.school} />
      </ReviewSection>

      <ReviewSection title="Academic session">
        {session ? <SessionSummary session={session} /> : <p className="text-sm text-n-400 italic">Skipped.</p>}
      </ReviewSection>

      <ReviewSection title="Classes">
        <ClassesSummary classes={review.classes} />
      </ReviewSection>

      <ReviewSection title="Subjects">
        <SubjectsSummary subjects={review.subjects} />
      </ReviewSection>

      <p className="text-xs text-n-400">
        You can update all of these settings from your dashboard at any time — editing here isn&rsquo;t available yet.
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
