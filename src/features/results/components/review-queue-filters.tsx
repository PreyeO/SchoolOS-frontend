"use client";

import { ArmPicker } from "@/components/shared/arm-picker";
import { TermPicker } from "@/components/shared/term-picker";
import { Select } from "@/components/ui/select";
import type { ArmOptionGroup } from "@/lib/school/arm-options";
import type { PeriodOptionGroup } from "@/lib/school/period-options";

import type { ReviewQueueSubjectOption } from "../hooks/use-review-queue-view";

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
}

// Term, class and subject.
//
// Term is a SERVER filter — it keys the request, because a school's whole
// history across every term would be an unbounded fetch. Class and subject
// filter the already-fetched term in place: useReviewQueue pages through the
// backend to get the complete term regardless of its size (bounded by
// classes × subjects, not by pupils), so narrowing here never hides a
// submission that just didn't happen to load.
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
        {/* Built from the submissions actually returned, not the school's whole
            subject list — offering a subject nobody has submitted would filter
            to an empty table with nothing to explain it. Narrows to the picked
            class's own subjects once one is chosen, and disambiguator (set only
            on an actual name collision — see useReviewQueueView) tells apart two
            different subjects that would otherwise render identically. */}
        <Select
          value={subjectId}
          onChange={(e) => onSubjectChange(e.target.value)}
          aria-label="Filter by subject"
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
