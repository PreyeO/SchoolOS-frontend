"use client";

import { Select } from "@/components/ui/select";
import type { PeriodOptionGroup } from "@/lib/school/period-options";

interface Props {
  groups: PeriodOptionGroup[];
  value: string | null;
  onChange: (periodId: string) => void;
  label?: string;
  id?: string;
  placeholder?: string;
  hasError?: boolean;
}

// Picks one term, grouped under its session.
//
// The current term is marked rather than being the only choice — screens that
// work ahead of the calendar (setting next term's fees) or behind it (chasing a
// closed term's arrears) need to leave it, and the label is what tells the user
// which one the school is actually running.
export function TermPicker({ groups, value, onChange, label = "Term", id, placeholder, hasError }: Props) {
  const select = (
    <Select
      id={id}
      aria-label={id ? undefined : label}
      aria-invalid={hasError || undefined}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-48 aria-invalid:border-destructive"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {groups.map((group) => (
        <optgroup key={group.sessionId} label={group.sessionName}>
          {group.options.map((option) => (
            <option key={option.periodId} value={option.periodId}>
              {option.label}
              {option.isCurrent ? " (current)" : ""}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );

  if (id) return select;

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-n-500">{label}</span>
      {select}
    </label>
  );
}
