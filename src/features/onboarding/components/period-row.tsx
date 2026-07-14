"use client";

import { Trash2 } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import type { AcademicYearFormValues } from "../schemas/academic-year-schema";

interface Props {
  index: number;
  onInputMount?: (el: HTMLInputElement | null) => void;
  register: UseFormRegister<AcademicYearFormValues>;
  errors: FieldErrors<AcademicYearFormValues>;
  isCurrent: boolean;
  name: string;
  hasData: boolean;
  onSetCurrent: () => void;
  onRemove: () => void;
}

export function PeriodRow({
  index: i,
  onInputMount,
  register,
  errors,
  isCurrent,
  name,
  hasData,
  onSetCurrent,
  onRemove,
}: Props) {
  const nameField = register(`periods.${i}.name`);

  return (
    <div className="rounded-xl border border-n-200 p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <Input
          id={`periods.${i}.name`}
          placeholder="e.g. 1st Term"
          className="flex-1 font-medium"
          aria-invalid={!!errors.periods?.[i]?.name}
          aria-describedby={errors.periods?.[i]?.name ? `periods.${i}.name-error` : undefined}
          {...nameField}
          ref={(el) => {
            nameField.ref(el);
            onInputMount?.(el);
          }}
        />
        <label className="flex items-center gap-1.5 cursor-pointer text-xs shrink-0">
          <input
            type="radio"
            name="current-period"
            checked={isCurrent}
            onChange={onSetCurrent}
            className="accent-brand"
            aria-label={`Set ${name || "this term"} as the current term`}
          />
          <span className={isCurrent ? "text-brand font-medium" : "text-n-400"}>Current</span>
        </label>
        {hasData ? (
          <ConfirmDeleteDialog
            trigger={
              <button
                type="button"
                aria-label={`Remove ${name || `term ${i + 1}`}`}
                className="shrink-0 text-n-400 hover:text-clay transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            }
            title={`Remove ${name || "this term"}?`}
            description="Its dates will be lost."
            confirmLabel="Remove"
            onConfirm={onRemove}
          />
        ) : (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${name || `term ${i + 1}`}`}
            className="shrink-0 text-n-400 hover:text-clay transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
      {errors.periods?.[i]?.name && (
        <p id={`periods.${i}.name-error`} role="alert" className="text-xs text-red-600">
          {errors.periods[i]?.name?.message}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-n-500" htmlFor={`periods.${i}.start_date`}>Start date</label>
          <Input
            id={`periods.${i}.start_date`}
            type="date"
            className="h-9"
            aria-invalid={!!errors.periods?.[i]?.start_date}
            aria-describedby={errors.periods?.[i]?.start_date ? `periods.${i}.start_date-error` : undefined}
            {...register(`periods.${i}.start_date`)}
          />
          {errors.periods?.[i]?.start_date && (
            <p id={`periods.${i}.start_date-error`} role="alert" className="text-xs text-red-600 mt-1">
              {errors.periods[i]?.start_date?.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-n-500" htmlFor={`periods.${i}.end_date`}>End date</label>
          <Input
            id={`periods.${i}.end_date`}
            type="date"
            className="h-9"
            aria-invalid={!!errors.periods?.[i]?.end_date}
            aria-describedby={errors.periods?.[i]?.end_date ? `periods.${i}.end_date-error` : undefined}
            {...register(`periods.${i}.end_date`)}
          />
          {errors.periods?.[i]?.end_date && (
            <p id={`periods.${i}.end_date-error`} role="alert" className="text-xs text-red-600 mt-1">
              {errors.periods[i]?.end_date?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
