"use client";

import { Select } from "@/components/ui/select";
import type { ClassOptionGroup } from "@/lib/school/class-options";

interface Props {
  groups: ClassOptionGroup[];
  value: string | null;
  onChange: (classId: string) => void;
  label?: string;
  id?: string;
  placeholder?: string;
  hasError?: boolean;
}

// Picks one class. The sibling of ArmPicker for the screens that bill, group or
// report at class level rather than per arm — see buildClassOptions for why the
// two can't share a builder.
export function ClassPicker({ groups, value, onChange, label = "Class", id, placeholder, hasError }: Props) {
  const select = (
    <Select
      id={id}
      aria-label={id ? undefined : label}
      aria-invalid={hasError || undefined}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-44 aria-invalid:border-destructive"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {groups.map((group) => (
        <optgroup key={group.level} label={group.levelLabel}>
          {group.options.map((option) => (
            <option key={option.classId} value={option.classId}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );

  // With an id the caller owns the label; without one this supplies its own.
  if (id) return select;

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-n-500">{label}</span>
      {select}
    </label>
  );
}
