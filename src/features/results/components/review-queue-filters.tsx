"use client";

import { ArmPicker } from "@/components/shared/arm-picker";
import { TermPicker } from "@/components/shared/term-picker";
import { Select } from "@/components/ui/select";
import type { ArmOptionGroup } from "@/lib/school/arm-options";
import type { PeriodOptionGroup } from "@/lib/school/period-options";

import type { ReviewQueueSubjectOption } from "../hooks/use-review-queue-subjects";

interface Props {
  termGroups: PeriodOptionGroup[];
  periodId: string | null;
  onPeriodChange: (id: string) => void;
  armGroups: ArmOptionGroup[];
  // "" means every class. ArmPicker's `placeholder` already renders an
  // empty-value option, so the shared picker covers this without a variant.
  armId: string;
  onArmChange: (id: string) => void;
  subjects: ReviewQueueSubjectOption[];
  subjectId: string;
  onSubjectChange: (id: string) => void;
  subjectsPending: boolean;
}

// Term, class and subject — all three are SERVER filters now
// (2026-09-05): each keys the submissions request directly, so narrowing here
// never hides a row that just didn't happen to load on the current page.
export function ReviewQueueFilters({
  termGroups,
  periodId,
  onPeriodChange,
  armGroups,
  armId,
  onArmChange,
  subjects,
  subjectId,
  onSubjectChange,
  subjectsPending,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-n-200 bg-white p-4">
      <TermPicker groups={termGroups} value={periodId} onChange={onPeriodChange} label="Term" />

      <ArmPicker
        groups={armGroups}
        value={armId}
        onChange={onArmChange}
        label="Class"
        placeholder="All classes"
      />

      <label className="flex items-center gap-2 text-sm">
        <span className="text-n-500">Subject</span>
        {/* The school's own subjects (or the picked class's own, once one is
            chosen) — not derived from submissions, so this never depends on
            which page of them happens to be loaded. disambiguator (set only
            on an actual name collision — see useReviewQueueSubjects) tells
            apart two different subjects that would otherwise render
            identically. */}
        <Select
          value={subjectId}
          onChange={(e) => onSubjectChange(e.target.value)}
          aria-label="Filter by subject"
          disabled={subjectsPending}
          className="min-w-44"
        >
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.disambiguator ? `${s.name} — ${s.disambiguator}` : s.name}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
}
