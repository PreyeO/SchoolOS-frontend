"use client";

import type { ArmOptionGroup } from "@/lib/school/arm-options";

interface Props {
  groups: ArmOptionGroup[];
  value: string | null;
  onChange: (armId: string) => void;
  label?: string;
  id?: string;
  // Rendered as a leading option when nothing is chosen yet — for forms where
  // there's no sensible default and picking must be deliberate.
  placeholder?: string;
  hasError?: boolean;
}

// Picks one teaching unit (an arm, or a whole class when its only arm is the
// system placeholder). Grouped by level in school order.
export function ArmPicker({ groups, value, onChange, label = "Class arm", id, placeholder, hasError }: Props) {
  const select = (
    <select
      id={id}
      aria-label={id ? undefined : label}
      aria-invalid={hasError || undefined}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 min-w-52 rounded-lg border border-input bg-background px-2 text-sm text-ink aria-invalid:border-red-500"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {groups.map((group) => (
        <optgroup key={group.level} label={group.levelLabel}>
          {group.options.map((option) => (
            <option key={option.armId} value={option.armId}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );

  // With an id the caller owns the label (e.g. FieldWrapper); without one this
  // supplies its own inline label.
  if (id) return select;

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-n-500">{label}</span>
      {select}
    </label>
  );
}
