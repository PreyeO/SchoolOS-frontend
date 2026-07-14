"use client";

import { useRef } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { FieldErrors } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentAcademicYear, getDefaultTerms, getSessionStartYear } from "@/data/term-defaults";
import type { StepKey } from "@/lib/school/onboarding-steps";

import { academicYearSchema, type AcademicYearFormValues } from "../schemas/academic-year-schema";
import { useCreateSession } from "../hooks/use-create-session";
import { focusFirstError } from "../lib/first-error-field-id";
import { PrefillNotice } from "./prefill-notice";
import { PeriodRow } from "./period-row";

interface Props {
  onAdvanced: (step: StepKey) => void;
  onBack: () => void;
}

const DEFAULT_TERM_NAMES = ["1st Term", "2nd Term", "3rd Term"];

export function StepAcademicYear({ onAdvanced, onBack }: Props) {
  const { mutate, isPending } = useCreateSession(onAdvanced);
  const newRowRef = useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: getCurrentAcademicYear(),
      periods: getDefaultTerms(getSessionStartYear()).map((t, i) => ({
        name: DEFAULT_TERM_NAMES[i],
        start_date: t.start_date,
        end_date: t.end_date,
        is_current: t.is_current,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "periods" });
  const periods = useWatch({ control, name: "periods" });

  function setCurrentPeriod(index: number) {
    periods.forEach((_, i) => setValue(`periods.${i}.is_current`, i === index));
  }

  function addPeriod() {
    append({ name: "", start_date: "", end_date: "", is_current: false });
    requestAnimationFrame(() => newRowRef.current?.focus());
  }

  function onInvalid(formErrors: FieldErrors<AcademicYearFormValues>) {
    focusFirstError(formErrors);
    const periodsErr = formErrors.periods;
    const rootMsg = periodsErr && "message" in periodsErr ? (periodsErr.message as string) : undefined;
    toast.error(rootMsg ?? formErrors.name?.message ?? "Please check the term dates and try again.");
  }

  return (
    <form onSubmit={handleSubmit((v) => mutate(v), onInvalid)} noValidate className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink" htmlFor="name">
          Academic session
        </label>
        <Input
          id="name"
          placeholder="e.g. 2025/2026"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        <p className="text-xs text-n-400">One academic year, split into any number of terms below.</p>
        {errors.name && (
          <p id="name-error" role="alert" className="text-xs text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <PrefillNotice>
        Typical term dates are filled in below — confirm they match your school&rsquo;s calendar,
        rename terms to fit how your school refers to them, and add or remove terms as needed.
      </PrefillNotice>

      <p aria-live="polite" className="sr-only">
        {fields.length} term{fields.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-3">
        {fields.map((field, i) => (
          <PeriodRow
            key={field.id}
            index={i}
            onInputMount={i === fields.length - 1 ? (el) => { newRowRef.current = el; } : undefined}
            register={register}
            errors={errors}
            isCurrent={!!periods?.[i]?.is_current}
            name={periods?.[i]?.name ?? ""}
            hasData={!!(periods?.[i]?.name || periods?.[i]?.start_date)}
            onSetCurrent={() => setCurrentPeriod(i)}
            onRemove={() => remove(i)}
          />
        ))}
      </div>

      {errors.periods && "message" in errors.periods && (
        <p className="text-xs text-red-600">{errors.periods.message as string}</p>
      )}

      <Button type="button" variant="ghost" size="sm" className="text-brand" onClick={addPeriod}>
        <Plus className="size-4 mr-1" /> Add term
      </Button>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-amber hover:bg-amber/90 text-ink font-semibold"
        >
          {isPending ? "Saving…" : "Save & continue"}
        </Button>
      </div>
    </form>
  );
}
