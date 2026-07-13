"use client";

import { cn } from "@/lib/utils";
import { STEP_KEYS, type StepKey } from "@/lib/school/onboarding-steps";

const STEP_LABELS: Record<StepKey, string> = {
  branding: "Branding",
  academic_year: "Academic year",
  classes: "Classes",
  subjects: "Subjects",
  review: "Review",
};

interface Props {
  activeIndex: number;
  maxIndex: number;
  onJump: (index: number) => void;
}

export function StepIndicator({ activeIndex, maxIndex, onJump }: Props) {
  return (
    <div role="tablist" aria-label="Onboarding steps" className="flex items-center gap-2 mb-8 flex-wrap">
      {STEP_KEYS.map((key, i) => {
        const reachable = i <= maxIndex;
        return (
          <div key={key} className="flex items-center gap-2">
            <button
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-current={i === activeIndex ? "step" : undefined}
              aria-label={`${STEP_LABELS[key]}${i < maxIndex ? " (complete)" : ""}`}
              disabled={!reachable}
              onClick={() => reachable && onJump(i)}
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i < maxIndex ? "bg-brand text-white" : i === maxIndex ? "bg-amber text-ink" : "bg-n-100 text-n-400",
                i === activeIndex && "ring-2 ring-offset-2 ring-brand",
                !reachable && "cursor-not-allowed opacity-60",
              )}
            >
              {i + 1}
            </button>
            <span className={cn("hidden sm:block text-xs font-medium", i === activeIndex ? "text-ink" : "text-n-400")}>
              {STEP_LABELS[key]}
            </span>
            {i < STEP_KEYS.length - 1 && (
              <div className={cn("h-px w-6 sm:w-10", i < maxIndex ? "bg-brand" : "bg-n-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
