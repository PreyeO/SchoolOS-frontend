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
    // A hairline between ranges below sm. Each range is two lines on a phone
    // (numbers, then remark), so without a rule the remark of one range sits as
    // close to the numbers of the next as to its own and the pairs blur together.
    // last: drops it after the final range, sm: drops it entirely — on desktop a
    // range is one line and needs no separator.
    <div className="space-y-1 border-b border-n-100 pb-3 last:border-b-0 last:pb-0 sm:border-b-0 sm:pb-0">
      {/* Wraps on a phone. Grade + min + max + remark + delete add up to more than
          the dialog is wide (~290px), so the flex-1 remark box was squeezed to a
          sliver and the dialog scrolled sideways, clipping its own title. Now the
          numbers and delete share the first line and the remark takes the second
          (order-last + full width); from sm up it's one row again. */}
      <div className="flex flex-wrap items-center gap-2">
        {/* ids are the react-hook-form paths so focusFirstError() can target them. */}
        <Input
          id={`ranges.${i}.grade`}
          // Just "Grade": "Grade (e.g. A1)" is wider than the 80px box on a phone
          // and showed as "Grade (e.". The example is lost only on a freshly added
          // blank range; the pre-filled defaults already show real grades.
          placeholder="Grade"
          aria-label="Grade"
          className="w-20 sm:w-24"
          aria-invalid={!!rowErrors?.grade}
          {...register(`ranges.${i}.grade`)}
        />
        <Input
          id={`ranges.${i}.min_score`}
          type="number"
          min={0}
          max={100}
          placeholder="Min"
          className="w-16 sm:w-20"
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
          className="w-16 sm:w-20"
          aria-label="Maximum score"
          aria-invalid={!!rowErrors?.max_score}
          {...register(`ranges.${i}.max_score`, { valueAsNumber: true })}
        />
        <Input
          id={`ranges.${i}.remark`}
          placeholder="Remark (e.g. Excellent)"
          className="order-last sm:order-0 sm:flex-1"
          aria-invalid={!!rowErrors?.remark}
          {...register(`ranges.${i}.remark`)}
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove grade range ${i + 1}`}
          className="ml-auto shrink-0 text-n-400 hover:text-clay transition-colors sm:ml-0"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {rowError && <p role="alert" className="text-xs text-red-600">{rowError.message}</p>}
    </div>
  );
}
