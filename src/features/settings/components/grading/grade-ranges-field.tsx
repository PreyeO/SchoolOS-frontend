"use client";

import { useFieldArray } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Plus } from "lucide-react";

import type { GradingSystemFormValues } from "../../schemas/grading-schema";
import { GradeRangeRow } from "./grade-range-row";

interface Props {
  control: Control<GradingSystemFormValues>;
  register: UseFormRegister<GradingSystemFormValues>;
  errors: FieldErrors<GradingSystemFormValues>;
}

export function GradeRangesField({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: "ranges" });

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-ink">Grade ranges</p>
      <div className="space-y-2">
        {fields.map((field, i) => (
          <GradeRangeRow key={field.id} index={i} register={register} errors={errors} onRemove={() => remove(i)} />
        ))}
      </div>
      {typeof errors.ranges?.message === "string" && (
        <p role="alert" className="text-xs text-red-600">{errors.ranges.message}</p>
      )}
      <button
        type="button"
        onClick={() => append({ grade: "", min_score: 0, max_score: 0, remark: "" })}
        className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <Plus className="size-3.5" /> Add range
      </button>
    </div>
  );
}
