"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { FieldErrors } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useSchoolStore } from "@/stores/school-store";
import type { SchoolLevelValue } from "@/data/school-levels";
import type { StepKey } from "@/lib/school/onboarding-steps";

import { classesSchema, type ClassesFormValues } from "../schemas/classes-schema";
import { useCreateClasses } from "../hooks/use-create-classes";
import { suggestClasses } from "../lib/suggest-classes";
import { focusFirstError } from "../lib/first-error-field-id";
import { ClassRow } from "./class-row";
import { PrefillNotice } from "./prefill-notice";

interface Props {
  onAdvanced: (step: StepKey) => void;
  onBack: () => void;
}

export function StepClasses({ onAdvanced, onBack }: Props) {
  const levels = useSchoolStore((s) => s.currentSchool?.levels);
  const { mutate, isPending } = useCreateClasses(onAdvanced);

  const { register, handleSubmit, control, formState: { errors } } = useForm<ClassesFormValues>({
    resolver: zodResolver(classesSchema),
    defaultValues: { classes: suggestClasses((levels ?? []) as SchoolLevelValue[]) },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "classes" });

  const rootError =
    errors.classes?.root?.message ?? (typeof errors.classes?.message === "string" ? errors.classes.message : undefined);

  function onInvalid(formErrors: FieldErrors<ClassesFormValues>) {
    focusFirstError(formErrors);
    toast.error(rootError ?? "Check that each class has a name, level, and at least one arm.");
  }

  function removeClass(index: number) {
    if (!window.confirm("Remove this class and all its arms?")) return;
    remove(index);
  }

  return (
    <form onSubmit={handleSubmit((v) => mutate(v), onInvalid)} noValidate className="space-y-4">
      <p className="text-sm text-n-500">
        Each class has a name, a level, and one or more arms (parallel classes), e.g.{" "}
        <span className="text-ink font-medium">Primary 1 · Arm A</span>.
      </p>

      <PrefillNotice>
        We&rsquo;ve suggested classes based on the levels you picked earlier. Double-check
        the names below and edit anything that doesn&rsquo;t match your school.
      </PrefillNotice>

      <div className="space-y-3">
        {fields.map((field, i) => (
          <ClassRow
            key={field.id}
            control={control}
            register={register}
            errors={errors}
            classIndex={i}
            onRemoveClass={() => removeClass(i)}
          />
        ))}
      </div>

      {rootError && <p className="text-xs text-red-600">{rootError}</p>}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-brand"
        onClick={() => append({ name: "", level: (levels?.[0] ?? "primary") as string, arms: [{ name: "" }] })}
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
