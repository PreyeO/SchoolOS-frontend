"use client";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";

import type { SubjectDraft } from "../../lib/subject-bulk-edit";

interface Props {
  selectedCount: number;
  schoolLevels: SchoolLevelValue[];
  onApply: (patch: Partial<SubjectDraft>) => void;
  onClear: () => void;
}

// Applies one change to every selected row at once.
//
// Editing each field inline is the general case, but the job people actually
// come here for — "these fourteen are core", "these all belong to Junior
// Secondary" — is the same edit repeated down a column. Without this it's
// fourteen clicks; with it, three.
export function BulkEditActions({ selectedCount, schoolLevels, onApply, onClear }: Props) {
  const levelOptions = SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value));

  if (selectedCount === 0) {
    return (
      <p className="text-sm text-n-400">
        Tick rows to change several at once, or edit any field directly.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-ink">
        {selectedCount} selected
      </span>

      <span className="h-4 w-px bg-n-200" aria-hidden="true" />

      <Button type="button" variant="outline" size="sm" onClick={() => onApply({ is_core: true })}>
        Mark core
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onApply({ is_core: false })}>
        Mark elective
      </Button>

      <Select
        aria-label="Move selected subjects to level"
        className="h-8 w-auto"
        value=""
        onChange={(e) => {
          if (e.target.value) onApply({ level: e.target.value });
        }}
      >
        <option value="">Move to level…</option>
        {levelOptions.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </Select>

      <Button type="button" variant="ghost" size="sm" onClick={onClear}>
        Clear selection
      </Button>
    </div>
  );
}
