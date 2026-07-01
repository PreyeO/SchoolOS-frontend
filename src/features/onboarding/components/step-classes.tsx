"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSchoolStore } from "@/stores/school-store";
import type { SchoolLevelValue } from "@/data/school-levels";

import { classesSchema, type ClassesFormValues } from "../schemas/classes-schema";
import { useCreateClasses } from "../hooks/use-create-classes";
import { suggestClasses } from "../lib/suggest-classes";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepClasses({ onNext, onBack }: Props) {
  const levels = useSchoolStore((s) => s.currentSchool?.levels ?? []);
  const { mutate, isPending } = useCreateClasses();

  const { register, handleSubmit, control, formState: { errors } } = useForm<ClassesFormValues>({
    resolver: zodResolver(classesSchema),
    defaultValues: { classes: [] },
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: "classes" });

  useEffect(() => {
    const suggested = suggestClasses(levels as SchoolLevelValue[]);
    if (suggested.length > 0) replace(suggested);
  }, [levels, replace]);

  const rootError = errors.classes?.root?.message ?? (errors.classes?.message as string | undefined);

  return (
    <form onSubmit={handleSubmit((v) => mutate(v, { onSuccess: onNext }))} noValidate className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-n-200 text-n-400">
              <th className="pb-2 text-left font-medium">Class name</th>
              <th className="pb-2 pl-3 text-left font-medium w-20">Section</th>
              <th className="pb-2 pl-3 text-left font-medium w-28">Max students</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-n-100">
            {fields.map((field, i) => (
              <tr key={field.id}>
                <td className="py-2 pr-3">
                  <Input className="h-8 text-sm" {...register(`classes.${i}.name`)} />
                </td>
                <td className="py-2 px-3">
                  <Input className="h-8 text-sm w-16" maxLength={3} {...register(`classes.${i}.section`)} />
                </td>
                <td className="py-2 px-3">
                  <Input
                    className="h-8 text-sm w-24"
                    type="number"
                    min={1}
                    {...register(`classes.${i}.max_students`, { valueAsNumber: true })}
                  />
                </td>
                <td className="py-2 pl-2">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-n-400 hover:text-clay transition-colors"
                    aria-label="Remove row"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rootError && <p className="text-xs text-red-600">{rootError}</p>}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-brand"
        onClick={() => append({ name: "", section: "A", max_students: 40 })}
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
          {isPending ? "Saving…" : `Save ${fields.length} class${fields.length !== 1 ? "es" : ""}`}
        </Button>
      </div>
    </form>
  );
}
