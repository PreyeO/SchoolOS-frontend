"use client";

import { CheckCircle2, ChevronDown, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SetupStage, SetupStepKey } from "../lib/setup-steps";
import type { TeachingUnitWords } from "@/lib/school/teaching-unit";
import { SetupStepRow } from "./setup-step-row";

interface Props {
  group: SetupStage;
  status: Record<SetupStepKey, boolean>;
  progress: Partial<Record<SetupStepKey, { done: number; total: number }>>;
  unitWords: TeachingUnitWords;
  wizardUnfinished: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

// One stage of the checklist, collapsed to its own progress count until opened.
//
// Only one stage is open at a time (the parent owns that): the list is long
// enough that an all-open view buries the thing actually being worked on.
export function SetupStageGroup({
  group,
  status,
  progress,
  unitWords,
  wizardUnfinished,
  isOpen,
  onToggle,
}: Props) {
  const done = group.steps.filter((s) => status[s.key]).length;
  const stageComplete = done === group.steps.length;

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
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
          className={cn("ml-auto size-3.5 text-n-400 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <ul className="space-y-0.5 pb-1 pl-8 pr-2">
          {group.steps.map((step) => (
            <SetupStepRow
              key={step.key}
              step={step}
              done={status[step.key]}
              progress={progress[step.key]}
              unitWords={unitWords}
              wizardUnfinished={wizardUnfinished}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
