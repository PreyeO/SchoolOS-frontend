"use client";

import type { UseFormRegisterReturn } from "react-hook-form";

import { teacherTypeDescription, teacherTypeLabel } from "@/features/staff/lib/teacher-type-label";
import type { TeacherType } from "@/features/staff/types";

// Labels and descriptions come from the shared helper, so this form and the
// pickers that filter on type can't drift apart in what they call things.
const TEACHER_TYPES: TeacherType[] = ["class", "subject", "both"];

// Radio cards rather than a <Select>: this is the one field on the invite form
// whose consequences aren't obvious from its label — it decides whether the
// person can take a register at all — and an option list can't carry the
// explanation. A native radio group keeps keyboard and screen-reader behaviour
// without a component.
//
// Extracted from the form when the class-arm picker pushed it past 150 lines.
// A real seam: this is a self-contained field that owns its own copy.
export function TeacherTypeField({
  field,
  error,
}: {
  field: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">
        Teacher type <span className="text-clay">*</span>
      </legend>
      <div className="space-y-2">
        {/* Selected styling via has-[:checked] rather than watch()ing the
            field: reading it in JS makes React Compiler skip memoizing this
            whole component, and the browser already knows which radio is
            checked. */}
        {TEACHER_TYPES.map((type) => (
          <label
            key={type}
            className="flex cursor-pointer gap-3 rounded-xl border border-n-200 p-3 transition-colors hover:border-n-300 has-checked:border-primary has-checked:bg-primary/5"
          >
            <input
              type="radio"
              value={type}
              {...field}
              className="mt-1 size-4 shrink-0 accent-primary"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">{teacherTypeLabel(type)}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-n-500">
                {teacherTypeDescription(type)}
              </span>
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-clay">
          {error}
        </p>
      )}
    </fieldset>
  );
}
