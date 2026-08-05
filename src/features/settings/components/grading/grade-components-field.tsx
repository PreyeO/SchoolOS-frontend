"use client";

import { useFieldArray, useWatch } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Plus } from "lucide-react";

import { arrayLevelMessage } from "../../lib/grading-form-error";
import type { GradingSystemFormValues } from "../../schemas/grading-schema";
import { GradeComponentRow } from "./grade-component-row";

interface Props {
  control: Control<GradingSystemFormValues>;
  register: UseFormRegister<GradingSystemFormValues>;
  errors: FieldErrors<GradingSystemFormValues>;
}

export function GradeComponentsField({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: "components" });
  const components = useWatch({ control, name: "components" }) ?? [];
  const totalScore = components.reduce((sum, c) => sum + (Number(c.max_obtainable) || 0), 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Components</p>
        <span className={totalScore === 100 ? "text-xs text-grass" : "text-xs text-clay"}>{totalScore} / 100</span>
      </div>
      <div className="space-y-2">
        {fields.map((field, i) => (
          <GradeComponentRow key={field.id} index={i} register={register} errors={errors} onRemove={() => remove(i)} />
        ))}
      </div>
      {arrayLevelMessage(errors.components) && (
        <p role="alert" className="text-xs text-red-600">{arrayLevelMessage(errors.components)}</p>
      )}
      <button
        type="button"
        onClick={() => append({ name: "", max_obtainable: 0 })}
        className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <Plus className="size-3.5" /> Add component
      </button>
    </div>
  );
}
