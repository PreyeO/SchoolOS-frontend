"use client";

import { AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";
import type { SubjectResponse } from "@/features/onboarding/types";

import type { SubjectDraft } from "../../lib/subject-bulk-edit";

interface Props {
  subject: SubjectResponse;
  draft: SubjectDraft;
  schoolLevels: SchoolLevelValue[];
  selected: boolean;
  changed: boolean;
  error?: string;
  onSelect: (selected: boolean) => void;
  onChange: (patch: Partial<SubjectDraft>) => void;
}

export function BulkEditRow({
  subject,
  draft,
  schoolLevels,
  selected,
  changed,
  error,
  onSelect,
  onChange,
}: Props) {
  const levelOptions = SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value));

  return (
    <tr
      className={`border-b border-n-100 last:border-0 ${error ? "bg-destructive/5" : changed ? "bg-primary/5" : ""}`}
    >
      <td className="py-2 pl-3 pr-1 align-top">
        <input
          type="checkbox"
          className="mt-2.5 accent-primary"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          aria-label={`Select ${subject.name}`}
        />
      </td>

      <td className="px-2 py-2 align-top">
        <Input
          value={draft.name}
          aria-label={`Name of ${subject.name}`}
          aria-invalid={!!error}
          className="h-9"
          onChange={(e) => onChange({ name: e.target.value })}
        />
        {error && (
          <p role="alert" className="mt-1 flex items-start gap-1 text-xs text-red-600">
            <AlertCircle className="mt-0.5 size-3 shrink-0" />
            {error}
          </p>
        )}
      </td>

      <td className="px-2 py-2 align-top">
        <Select
          value={draft.level}
          aria-label={`Level of ${subject.name}`}
          className="h-9"
          onChange={(e) => onChange({ level: e.target.value })}
        >
          {levelOptions.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </Select>
      </td>

      <td className="px-2 py-2 align-top">
        <label className="mt-2 flex items-center gap-2 text-sm text-n-600">
          <input
            type="checkbox"
            className="accent-primary"
            checked={draft.is_core}
            onChange={(e) => onChange({ is_core: e.target.checked })}
          />
          Core
        </label>
      </td>
    </tr>
  );
}
