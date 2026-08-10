"use client";

import type { ArmOptionGroup } from "../lib/arm-options";

interface Props {
  groups: ArmOptionGroup[];
  value: string | null;
  onChange: (armId: string) => void;
}

export function ArmPicker({ groups, value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-n-500">Class arm</span>
      <select
        aria-label="Class arm"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-52 rounded-lg border border-input bg-background px-2 text-sm text-ink"
      >
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
    </label>
  );
}
