"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import type { ClassesFormValues } from "../schemas/classes-schema";

export interface ClassGroupData {
  name: string;
  indices: number[];
}

interface Props {
  group: ClassGroupData;
  register: UseFormRegister<ClassesFormValues>;
  setValue: UseFormSetValue<ClassesFormValues>;
  errors: FieldErrors<ClassesFormValues>;
  onAddArm: () => void;
  onRemoveArm: (rowIndex: number) => void;
}

export function ClassGroup({ group, register, setValue, errors, onAddArm, onRemoveArm }: Props) {
  const firstIdx = group.indices[0];
  const nameField = register(`classes.${firstIdx}.name`);

  return (
    <div className="rounded-xl border border-n-200 p-3.5 space-y-3">
      <div className="flex items-center gap-2">
        <Input
          className="h-9 font-medium"
          placeholder="Class name (e.g. Primary 1)"
          {...nameField}
          onChange={(e) => {
            nameField.onChange(e);
            // Keep every arm of this class under the same name so the block stays together.
            group.indices.forEach((idx) => setValue(`classes.${idx}.name`, e.target.value));
          }}
        />
        <span className="shrink-0 text-xs text-n-400">
          {group.indices.length} arm{group.indices.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2">
        {group.indices.map((idx) => {
          const armError = errors.classes?.[idx]?.arm?.message;
          return (
            <div key={idx} className="flex items-center gap-2">
              <span className="shrink-0 text-xs text-n-400 w-8">Arm</span>
              <Input className="h-8 text-sm w-16" maxLength={3} {...register(`classes.${idx}.arm`)} />
              <Input
                className="h-8 text-sm w-24"
                type="number"
                min={1}
                placeholder="Capacity"
                {...register(`classes.${idx}.max_students`, { valueAsNumber: true })}
              />
              {armError && <span className="text-xs text-red-600 flex-1">{armError}</span>}
              <button
                type="button"
                onClick={() => onRemoveArm(idx)}
                className="ml-auto text-n-400 hover:text-clay transition-colors"
                aria-label="Remove arm"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onAddArm}
        className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
      >
        <Plus className="size-3.5" /> Add arm
      </button>
    </div>
  );
}
