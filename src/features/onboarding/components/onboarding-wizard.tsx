"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { StepBranding } from "./step-branding";
import { StepAcademicYear } from "./step-academic-year";
import { StepClasses } from "./step-classes";
import { StepSubjects } from "./step-subjects";
import { StepReview } from "./step-review";

const STEPS = [
  { label: "Branding" },
  { label: "Academic year" },
  { label: "Classes" },
  { label: "Subjects" },
  { label: "Review" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
              i < current && "bg-brand text-white",
              i === current && "bg-amber text-ink",
              i > current && "bg-n-100 text-n-400",
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "hidden sm:block text-xs font-medium",
              i === current ? "text-ink" : "text-n-400",
            )}
          >
            {step.label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "h-px w-6 sm:w-10",
                i < current ? "bg-brand" : "bg-n-200",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div>
      <StepIndicator current={step} />
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink">
          {STEPS[step].label}
        </h2>
        <p className="mt-1 text-sm text-n-500">Step {step + 1} of {STEPS.length}</p>
      </div>

      {step === 0 && <StepBranding onNext={next} onSkip={next} />}
      {step === 1 && <StepAcademicYear onNext={next} onBack={back} />}
      {step === 2 && <StepClasses onNext={next} onBack={back} />}
      {step === 3 && <StepSubjects onNext={next} onBack={back} />}
      {step === 4 && <StepReview onBack={back} />}
    </div>
  );
}
