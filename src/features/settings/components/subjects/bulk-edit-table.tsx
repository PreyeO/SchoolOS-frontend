"use client";

import type { SchoolLevelValue } from "@/data/school-levels";
import type { SubjectResponse } from "@/features/onboarding/types";

import type { DraftMap, SubjectDraft } from "../../lib/subject-bulk-edit";
import { BulkEditRow } from "./bulk-edit-row";

interface Props {
  subjects: SubjectResponse[];
  drafts: DraftMap;
  schoolLevels: SchoolLevelValue[];
  selected: Set<string>;
  changedIds: Set<string>;
  errors: Record<string, string>;
  onToggle: (id: string, selected: boolean) => void;
  onToggleAll: (selected: boolean) => void;
  onChange: (id: string, patch: Partial<SubjectDraft>) => void;
}

export function BulkEditTable({
  subjects,
  drafts,
  schoolLevels,
  selected,
  changedIds,
  errors,
  onToggle,
  onToggleAll,
  onChange,
}: Props) {
  if (subjects.length === 0) {
    return (
      <div className="rounded-xl border border-n-200 bg-white py-10 text-center">
        <p className="text-sm text-n-400 italic">No subjects match.</p>
      </div>
    );
  }

  const allSelected = subjects.every((s) => selected.has(s.id));
  // Distinct from "none selected" so the box shows a dash rather than reading
  // as empty when only part of the filtered list is ticked.
  const someSelected = !allSelected && subjects.some((s) => selected.has(s.id));

  return (
    <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
      {/* min-w gives the table a floor so it scrolls sideways (the wrapper
          already does) rather than squashing: with the Level and Type columns
          fixed at 13rem + 7rem, the Subject column was left ~40px on a phone
          and its input showed "Crea". */}
      <table className="w-full min-w-xl text-left">
        <thead>
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            <th className="py-2.5 pl-3 pr-1 font-medium">
              <input
                type="checkbox"
                className="accent-primary"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={(e) => onToggleAll(e.target.checked)}
                aria-label={allSelected ? "Deselect all shown" : "Select all shown"}
              />
            </th>
            <th className="min-w-48 px-2 py-2.5 font-medium">Subject</th>
            <th className="w-52 px-2 py-2.5 font-medium">Level</th>
            <th className="w-28 px-2 py-2.5 font-medium">Type</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s) => (
            <BulkEditRow
              key={s.id}
              subject={s}
              draft={drafts[s.id]}
              schoolLevels={schoolLevels}
              selected={selected.has(s.id)}
              changed={changedIds.has(s.id)}
              error={errors[s.id]}
              onSelect={(next) => onToggle(s.id, next)}
              onChange={(patch) => onChange(s.id, patch)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
