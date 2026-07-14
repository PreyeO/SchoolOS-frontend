"use client";

import { useFieldArray, useWatch } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { cn } from "@/lib/utils";
import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";
import type { ClassesFormValues } from "../schemas/classes-schema";
import { nextArmName } from "../lib/arm-utils";

interface Props {
  control: Control<ClassesFormValues>;
  register: UseFormRegister<ClassesFormValues>;
  errors: FieldErrors<ClassesFormValues>;
  classIndex: number;
  schoolLevels: SchoolLevelValue[];
  onRemoveClass: () => void;
}

function RemoveButton({ onClick, ariaLabel, className }: { onClick?: () => void; ariaLabel: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn("shrink-0 text-n-400 hover:text-clay transition-colors", className)}
    >
      <Trash2 className="size-4" />
    </button>
  );
}

export function ClassRow({ control, register, errors, classIndex: ci, schoolLevels, onRemoveClass }: Props) {
  const levelOptions = SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value));
  const { fields, append, remove } = useFieldArray({ control, name: `classes.${ci}.arms` });
  const className = useWatch({ control, name: `classes.${ci}.name` });
  const arms = useWatch({ control, name: `classes.${ci}.arms` });
  const classErrors = errors.classes?.[ci];

  function addArm() {
    const existingNames = (arms ?? []).map((a) => a?.name ?? "");
    append({ name: nextArmName(className || "Class", existingNames) });
  }

  const hasClassData = !!(className || (arms ?? []).some((a) => a?.name));

  return (
    <div className="rounded-xl border border-n-200 p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <Input
          id={`classes.${ci}.name`}
          placeholder="Class name (e.g. Primary 1)"
          className="flex-1 font-medium"
          aria-invalid={!!classErrors?.name}
          aria-describedby={classErrors?.name ? `classes.${ci}.name-error` : undefined}
          {...register(`classes.${ci}.name`)}
        />
        <select
          id={`classes.${ci}.level`}
          aria-label="Level"
          aria-invalid={!!classErrors?.level}
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
          {...register(`classes.${ci}.level`)}
        >
          <option value="">Level…</option>
          {levelOptions.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
        {hasClassData ? (
          <ConfirmDeleteDialog
            trigger={<RemoveButton ariaLabel={`Remove class ${className || ""}`} />}
            title={`Remove ${className || "this class"}?`}
            description="This also removes any arms you've added below."
            confirmLabel="Remove"
            onConfirm={onRemoveClass}
          />
        ) : (
          <RemoveButton onClick={onRemoveClass} ariaLabel={`Remove class ${className || ""}`} />
        )}
      </div>
      {classErrors?.name && (
        <p id={`classes.${ci}.name-error`} role="alert" className="text-xs text-red-600">
          {classErrors.name.message}
        </p>
      )}
      {classErrors?.level && (
        <p role="alert" className="text-xs text-red-600">{classErrors.level.message}</p>
      )}

      {fields.length === 0 && (
        <p className="text-xs text-n-400 italic">
          No arms yet — add one only if this class runs parallel arms (A, B, C…).
        </p>
      )}

      <div className="space-y-2">
        {fields.map((field, ai) => {
          const armError = classErrors?.arms?.[ai]?.name;
          const armName = arms?.[ai]?.name;
          return (
            <div key={field.id} className="flex items-center gap-2">
              <span className="shrink-0 text-xs text-n-400 w-8">Arm</span>
              <Input
                id={`classes.${ci}.arms.${ai}.name`}
                className="h-8 text-sm flex-1"
                aria-invalid={!!armError}
                aria-describedby={armError ? `classes.${ci}.arms.${ai}.name-error` : undefined}
                {...register(`classes.${ci}.arms.${ai}.name`)}
              />
              {armError && (
                <span id={`classes.${ci}.arms.${ai}.name-error`} role="alert" className="text-xs text-red-600">
                  {armError.message}
                </span>
              )}
              {armName ? (
                <ConfirmDeleteDialog
                  trigger={<RemoveButton ariaLabel={`Remove arm ${armName}`} className="ml-auto" />}
                  title={`Remove arm "${armName}"?`}
                  confirmLabel="Remove"
                  onConfirm={() => remove(ai)}
                />
              ) : (
                <RemoveButton onClick={() => remove(ai)} ariaLabel={`Remove arm ${ai + 1}`} className="ml-auto" />
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addArm}
        className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
      >
        <Plus className="size-3.5" /> Add arm
      </button>
    </div>
  );
}
