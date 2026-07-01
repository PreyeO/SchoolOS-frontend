"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSchoolStore } from "@/stores/school-store";
import type { SchoolLevelValue } from "@/data/school-levels";

import { classesSchema, type ClassesFormValues, type ClassRowValues } from "../schemas/classes-schema";
import { useCreateClasses } from "../hooks/use-create-classes";
import { suggestClasses } from "../lib/suggest-classes";
import { nextArm } from "../lib/arm-utils";
import { ClassGroup, type ClassGroupData } from "./class-group";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

// Contiguous runs of rows that share a class name read as one block.
function buildGroups(rows: Pick<ClassRowValues, "name">[]): ClassGroupData[] {
  const groups: ClassGroupData[] = [];
  rows.forEach((row, i) => {
    const last = groups[groups.length - 1];
    if (last && last.name === row.name) last.indices.push(i);
    else groups.push({ name: row.name, indices: [i] });
  });
  return groups;
}

export function StepClasses({ onNext, onBack }: Props) {
  // Read the stored levels reference directly (no `?? []` — that would create a
  // new array every render). Suggested classes are seeded once via defaultValues.
  const levels = useSchoolStore((s) => s.currentSchool?.levels);
  const { mutate, isPending } = useCreateClasses();

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<ClassesFormValues>({
    resolver: zodResolver(classesSchema),
    defaultValues: { classes: suggestClasses((levels ?? []) as SchoolLevelValue[]) },
  });

  const { fields, append, insert, remove } = useFieldArray({ control, name: "classes" });
  const watched = useWatch({ control, name: "classes" });
  const rows = (watched ?? fields) as ClassRowValues[];
  const groups = buildGroups(rows);

  const rootError = errors.classes?.root?.message ?? (errors.classes?.message as string | undefined);

  function addArm(group: ClassGroupData) {
    const lastIdx = group.indices[group.indices.length - 1];
    const arms = group.indices.map((i) => rows[i]?.arm ?? "");
    const capacity = rows[group.indices[0]]?.max_students ?? 30;
    insert(lastIdx + 1, { name: group.name, arm: nextArm(arms), max_students: capacity });
  }

  function onInvalid() {
    toast.error(rootError ?? "Check that each class has a name and no arm is duplicated.");
  }

  return (
    <form onSubmit={handleSubmit((v) => mutate(v, { onSuccess: onNext }), onInvalid)} noValidate className="space-y-4">
      <p className="text-sm text-n-500">
        Each row is one class and arm, e.g. <span className="text-ink font-medium">Primary 1 · Arm A · 30</span>.
        Add more arms only where you need parallel classes.
      </p>

      <div className="space-y-3">
        {groups.map((group) => (
          <ClassGroup
            key={fields[group.indices[0]]?.id ?? group.name}
            group={group}
            register={register}
            setValue={setValue}
            errors={errors}
            onAddArm={() => addArm(group)}
            onRemoveArm={remove}
          />
        ))}
      </div>

      <p className="text-xs text-n-400">
        <span className="font-medium text-n-500">Arm:</span> parallel classes, e.g. A, B, C. Most schools start with just A.
      </p>

      {rootError && <p className="text-xs text-red-600">{rootError}</p>}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-brand"
        onClick={() => append({ name: "", arm: "A", max_students: 30 })}
      >
        <Plus className="size-4 mr-1" /> Add class
      </Button>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-amber hover:bg-amber/90 text-ink font-semibold"
        >
          {isPending ? "Saving…" : `Save ${rows.length} class${rows.length !== 1 ? "es" : ""}`}
        </Button>
      </div>
    </form>
  );
}
