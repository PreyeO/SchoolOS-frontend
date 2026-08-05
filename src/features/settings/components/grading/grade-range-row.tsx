"use client";

import { Trash2 } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import type { GradingSystemFormValues } from "../../schemas/grading-schema";

interface Props {
  index: number;
  register: UseFormRegister<GradingSystemFormValues>;
  errors: FieldErrors<GradingSystemFormValues>;
  onRemove: () => void;
}

export function GradeRangeRow({ index: i, register, errors, onRemove }: Props) {
  const rowErrors = errors.ranges?.[i];
  const rowError = rowErrors?.grade ?? rowErrors?.min_score ?? rowErrors?.max_score ?? rowErrors?.remark;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {/* ids are the react-hook-form paths so focusFirstError() can target them. */}
        <Input
          id={`ranges.${i}.grade`}
          placeholder="Grade (e.g. A1)"
          className="w-24"
          aria-invalid={!!rowErrors?.grade}
          {...register(`ranges.${i}.grade`)}
        />
        <Input
          id={`ranges.${i}.min_score`}
          type="number"
          min={0}
          max={100}
          placeholder="Min"
          className="w-20"
          aria-label="Minimum score"
          aria-invalid={!!rowErrors?.min_score}
          {...register(`ranges.${i}.min_score`, { valueAsNumber: true })}
        />
        <span className="text-n-400">–</span>
        <Input
          id={`ranges.${i}.max_score`}
          type="number"
          min={0}
          max={100}
          placeholder="Max"
          className="w-20"
          aria-label="Maximum score"
          aria-invalid={!!rowErrors?.max_score}
          {...register(`ranges.${i}.max_score`, { valueAsNumber: true })}
        />
        <Input
          id={`ranges.${i}.remark`}
          placeholder="Remark (e.g. Excellent)"
          className="flex-1"
          aria-invalid={!!rowErrors?.remark}
          {...register(`ranges.${i}.remark`)}
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove grade range ${i + 1}`}
          className="shrink-0 text-n-400 hover:text-clay transition-colors"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {rowError && <p role="alert" className="text-xs text-red-600">{rowError.message}</p>}
    </div>
  );
}
