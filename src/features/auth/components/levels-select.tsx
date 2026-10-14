"use client";

import { cn } from "@/lib/utils";
import { SCHOOL_LEVELS } from "@/data/school-levels";
import { deriveSchoolType } from "@/lib/school/derive-school-type";

import type { SchoolLevel } from "../types";

interface LevelsSelectProps {
  value: SchoolLevel[];
  onChange: (levels: SchoolLevel[]) => void;
  error?: string;
}

export function LevelsSelect({ value, onChange, error }: LevelsSelectProps) {
  const derivedType = value.length > 0 ? deriveSchoolType(value) : null;

  function toggle(level: SchoolLevel) {
    const next = value.includes(level)
      ? value.filter((l) => l !== level)
      : [...value, level];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SCHOOL_LEVELS.map((level) => {
          const checked = value.includes(level.value as SchoolLevel);
          return (
            <label
              key={level.value}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors select-none",
                checked
                  ? "border-brand bg-brand/5 text-ink"
                  : "border-n-200 hover:border-n-400 text-n-600"
              )}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
                checked={checked}
                onChange={() => toggle(level.value as SchoolLevel)}
                aria-label={level.label}
              />
              <div>
                <p className="text-sm font-medium leading-snug">{level.label}</p>
                <p className="text-xs text-n-400 mt-0.5">{level.description}</p>
              </div>
            </label>
          );
        })}
      </div>
      {derivedType && (
        <p className="text-xs text-n-500">
          Type:{" "}
          <span className="capitalize font-medium text-brand">{derivedType}</span>
          {" "}school
        </p>
      )}
      {error && (
        <p id="levels-error" role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
