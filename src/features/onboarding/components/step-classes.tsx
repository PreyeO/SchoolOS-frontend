"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { FieldErrors } from "react-hook-form";

import { Button } from "@/components/ui/button";
import type { StepKey } from "@/lib/school/onboarding-steps";
import { useSchoolLevels } from "@/lib/school/use-school-levels";

import { classesSchema, type ClassesFormValues } from "../schemas/classes-schema";
import { useCreateClasses } from "../hooks/use-create-classes";
import { useClassTemplates } from "../hooks/use-class-templates";
import { useSeedClassesFromTemplates } from "../hooks/use-seed-classes-from-templates";
import { focusFirstError } from "../lib/first-error-field-id";
import { ClassRow } from "./class-row";
import { PrefillNotice } from "./prefill-notice";

interface Props {
  onAdvanced: (step: StepKey) => void;
  onBack: () => void;
}

export function StepClasses({ onAdvanced, onBack }: Props) {
  const { levels: schoolLevels, isLoading: levelsLoading } = useSchoolLevels();
  const { data: templates, isPending: templatesLoading } = useClassTemplates();
  const { mutate, isPending } = useCreateClasses(onAdvanced);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ClassesFormValues>({
    resolver: zodResolver(classesSchema),
    defaultValues: { classes: [] },
  });

  useSeedClassesFromTemplates({ schoolLevels, levelsLoading, templates, reset });

  const { fields, append, remove } = useFieldArray({ control, name: "classes" });

  const rootError =
    errors.classes?.root?.message ?? (typeof errors.classes?.message === "string" ? errors.classes.message : undefined);

  function onInvalid(formErrors: FieldErrors<ClassesFormValues>) {
    focusFirstError(formErrors);
    toast.error(rootError ?? "Check that each class has a name and a level.");
  }

  return (
    <form onSubmit={handleSubmit((v) => mutate(v), onInvalid)} noValidate className="space-y-4">
      <p className="text-sm text-n-500">
        Each class needs a name and a level, e.g.{" "}
        <span className="text-ink font-medium">Primary 1</span>. Add arms only if
        your school runs parallel classes (e.g. Primary 1 A, Primary 1 B).
      </p>

      <PrefillNotice>
        We&rsquo;ve suggested classes based on the levels you picked earlier. Double-check
        the names below and edit anything that doesn&rsquo;t match your school.
      </PrefillNotice>

      {(templatesLoading || levelsLoading) && (
        <p className="text-sm text-n-400" role="status">Loading suggested classes…</p>
      )}

      <div className="space-y-3">
        {fields.map((field, i) => (
          <ClassRow
            key={field.id}
            control={control}
            register={register}
            errors={errors}
            classIndex={i}
            schoolLevels={schoolLevels}
            onRemoveClass={() => remove(i)}
          />
        ))}
      </div>

      {rootError && <p className="text-xs text-red-600">{rootError}</p>}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-brand"
        onClick={() => append({ name: "", level: schoolLevels[0] ?? "primary", arms: [] })}
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
