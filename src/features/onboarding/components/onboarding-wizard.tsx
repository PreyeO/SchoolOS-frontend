"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { STEP_KEYS, stepIndex, type StepKey } from "@/lib/school/onboarding-steps";

import { useOnboardingStage } from "../hooks/use-onboarding-stage";
import { useOnboardingReview } from "../hooks/use-onboarding-review";
import { StepIndicator } from "./step-indicator";
import { StepBranding } from "./step-branding";
import { StepAcademicYear } from "./step-academic-year";
import { StepClasses } from "./step-classes";
import { StepSubjects } from "./step-subjects";
import { StepReview } from "./step-review";
import { CompletedStepView } from "./completed-step-view";

const STEP_LABELS: Record<StepKey, string> = {
  branding: "Branding",
  academic_year: "Academic year",
  classes: "Classes",
  subjects: "Subjects",
  review: "Review",
};

export function OnboardingWizard() {
  const router = useRouter();
  const { data: stage, isPending: stageLoading } = useOnboardingStage();
  const { data: review } = useOnboardingReview();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The server's current_step is the source of truth for progress; activeIndex
  // is purely a local "which step am I looking at" cursor that can move
  // backward over already-completed (read-only) steps without re-saving them.
  const [serverIndex, setServerIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Seed local state once the stage loads — during render, not an effect.
  if (stage && serverIndex === null) {
    if (stage.is_completed) {
      router.replace("/dashboard");
    } else {
      const idx = stepIndex(stage.current_step);
      setServerIndex(idx);
      setActiveIndex(idx);
    }
  }

  if (stageLoading || serverIndex === null || activeIndex === null) {
    return <p className="text-sm text-n-400" role="status">Loading your setup…</p>;
  }

  const activeKey = STEP_KEYS[activeIndex];

  function focusHeading() {
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function handleAdvanced(newStep: StepKey) {
    const idx = stepIndex(newStep);
    setServerIndex(idx);
    setActiveIndex(idx);
    focusHeading();
  }

  function goBack() {
    setActiveIndex((i) => Math.max((i ?? 0) - 1, 0));
    focusHeading();
  }

  function jump(i: number) {
    setActiveIndex(i);
    focusHeading();
  }

  return (
    <div>
      <StepIndicator activeIndex={activeIndex} maxIndex={serverIndex} onJump={jump} />
      <div className="mb-6">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold text-ink outline-none">
          {STEP_LABELS[activeKey]}
        </h2>
        <p aria-live="polite" className="mt-1 text-sm text-n-500">
          Step {activeIndex + 1} of {STEP_KEYS.length}
        </p>
      </div>

      {activeIndex < serverIndex ? (
        <CompletedStepView
          step={activeKey}
          review={review}
          onBack={activeIndex > 0 ? goBack : undefined}
          onContinue={() => jump(Math.min(activeIndex + 1, serverIndex))}
        />
      ) : (
        <>
          {activeKey === "branding" && <StepBranding onAdvanced={handleAdvanced} />}
          {activeKey === "academic_year" && <StepAcademicYear onAdvanced={handleAdvanced} onBack={goBack} />}
          {activeKey === "classes" && <StepClasses onAdvanced={handleAdvanced} onBack={goBack} />}
          {activeKey === "subjects" && <StepSubjects onAdvanced={handleAdvanced} onBack={goBack} />}
          {activeKey === "review" && <StepReview onBack={goBack} />}
        </>
      )}
    </div>
  );
}
