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

export function GradeComponentRow({ index: i, register, errors, onRemove }: Props) {
  const rowErrors = errors.components?.[i];
  // Each input's id is its react-hook-form path, so focusFirstError() can jump
  // to the offending field on a failed submit — same convention as the
  // onboarding step forms.
  const nameId = `components.${i}.name`;
  const scoreId = `components.${i}.max_obtainable`;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Input
          id={nameId}
          placeholder="e.g. 1st CA"
          className="flex-1"
          aria-invalid={!!rowErrors?.name}
          {...register(`components.${i}.name`)}
        />
        <Input
          id={scoreId}
          type="number"
          min={1}
          max={100}
          placeholder="Score"
          className="w-24"
          aria-label="Max obtainable score"
          aria-invalid={!!rowErrors?.max_obtainable}
          {...register(`components.${i}.max_obtainable`, { valueAsNumber: true })}
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove component ${i + 1}`}
          className="shrink-0 text-n-400 hover:text-clay transition-colors"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {(rowErrors?.name || rowErrors?.max_obtainable) && (
        <p role="alert" className="text-xs text-red-600">
          {rowErrors?.name?.message ?? rowErrors?.max_obtainable?.message}
        </p>
      )}
    </div>
  );
}
