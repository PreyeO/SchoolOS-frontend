"use client";

import { ArmPicker } from "@/components/shared/arm-picker";
import { TermPicker } from "@/components/shared/term-picker";
import { Select } from "@/components/ui/select";
import type { ArmOptionGroup } from "@/lib/school/arm-options";
import type { PeriodOptionGroup } from "@/lib/school/period-options";
import type { ClassArmSubject } from "@/features/teaching-assignments/types";
import { cn } from "@/lib/utils";

export type LeaderboardMode = "overall" | "subject";

const MODES: { key: LeaderboardMode; label: string }[] = [
  { key: "overall", label: "Overall" },
  { key: "subject", label: "By subject" },
];

interface Props {
  mode: LeaderboardMode;
  onModeChange: (mode: LeaderboardMode) => void;
  groups: ArmOptionGroup[];
  armId: string | null;
  onArmChange: (id: string) => void;
  offerings: ClassArmSubject[];
  subjectId: string | null;
  onSubjectChange: (id: string) => void;
  // Null when the selected arm's class can't be resolved, or has only one arm —
  // in which case ranking "across the class" is the same list.
  className: string | null;
  acrossClass: boolean;
  onAcrossClassChange: (value: boolean) => void;
  termGroups: PeriodOptionGroup[];
  periodId: string | null;
  onPeriodChange: (id: string) => void;
}

// What's being ranked. Lifted out of the page because it's a self-contained
// controlled unit, and because the page's job is the fetch/empty/error split.
export function LeaderboardFilters({
  mode,
  onModeChange,
  groups,
  armId,
  onArmChange,
  offerings,
  subjectId,
  onSubjectChange,
  className,
  acrossClass,
  onAcrossClassChange,
  termGroups,
  periodId,
  onPeriodChange,
}: Props) {
  return (
    <>
      <div className="flex flex-wrap items-end gap-3">
        <span className="flex gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => onModeChange(m.key)}
              aria-pressed={mode === m.key}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors",
                mode === m.key
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "border-n-200 text-n-500 hover:border-n-300",
              )}
            >
              {m.label}
            </button>
          ))}
        </span>
        <ArmPicker groups={groups} value={armId} onChange={onArmChange} label="Class" />
        {/* Both modes take a period, so the picker sits with the mode toggle
            rather than inside the by-subject block. */}
        <TermPicker groups={termGroups} value={periodId} onChange={onPeriodChange} label="Term" />
      </div>

      {mode === "subject" && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-n-500">Subject</span>
            {/* text-base below md: under 16px iOS zooms the whole page on focus. */}
            <Select
              value={subjectId ?? ""}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="min-w-48"
            >
              {offerings.map((o) => (
                <option key={o.subject.id} value={o.subject.id}>
                  {o.subject.name}
                </option>
              ))}
            </Select>
          </label>
          {className && (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-n-600">
              <input
                type="checkbox"
                checked={acrossClass}
                onChange={(e) => onAcrossClassChange(e.target.checked)}
                className="size-4 accent-primary"
              />
              Rank across all of {className}
            </label>
          )}
        </div>
      )}
    </>
  );
}
