"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { useSchoolStore } from "@/stores/school-store";
import type { SchoolLevelValue } from "@/data/school-levels";
import { getSubjectsForLevels } from "@/data/nerdc-subjects";

import { subjectsSchema, type SubjectsFormValues } from "../schemas/subjects-schema";
import { useCreateSubjects } from "../hooks/use-create-subjects";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepSubjects({ onNext, onBack }: Props) {
  const levels = useSchoolStore((s) => s.currentSchool?.levels ?? []);
  const { mutate, isPending } = useCreateSubjects();
  const allSubjects = getSubjectsForLevels(levels as SchoolLevelValue[]);

  const { handleSubmit, setValue, formState: { errors } } = useForm<SubjectsFormValues>({
    resolver: zodResolver(subjectsSchema),
    defaultValues: { subjects: allSubjects },
  });

  const [selected, setSelected] = useState<Set<string>>(new Set(allSubjects));

  useEffect(() => {
    setValue("subjects", Array.from(selected));
  }, [selected, setValue]);

  function toggle(subject: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === allSubjects.length) setSelected(new Set());
    else setSelected(new Set(allSubjects));
  }

  return (
    <form onSubmit={handleSubmit((v) => mutate(v, { onSuccess: onNext }))} noValidate className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-n-500">
          {selected.size} of {allSubjects.length} selected
        </p>
        <button type="button" className="text-sm text-brand underline-offset-2 hover:underline" onClick={toggleAll}>
          {selected.size === allSubjects.length ? "Deselect all" : "Select all"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
        {allSubjects.map((subject) => (
          <label
            key={subject}
            className="flex items-center gap-2.5 rounded-lg border border-n-200 px-3 py-2 cursor-pointer hover:bg-n-50 transition-colors"
          >
            <input
              type="checkbox"
              className="accent-brand"
              checked={selected.has(subject)}
              onChange={() => toggle(subject)}
            />
            <span className="text-sm text-ink leading-tight">{subject}</span>
          </label>
        ))}
      </div>

      {errors.subjects && (
        <p className="text-xs text-red-600">{errors.subjects.message}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-amber hover:bg-amber/90 text-ink font-semibold"
        >
          {isPending ? "Saving…" : `Save ${selected.size} subject${selected.size !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </form>
  );
}
