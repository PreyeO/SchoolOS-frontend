"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCurrentAcademicYear,
  getDefaultTerms,
  getSessionStartYear,
  TERM_LABELS,
} from "@/data/term-defaults";

import { academicYearSchema, type AcademicYearFormValues } from "../schemas/academic-year-schema";
import { useCreateSession } from "../hooks/use-create-session";

function FieldErr({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-red-600 mt-1">{msg}</p> : null;
}

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepAcademicYear({ onNext, onBack }: Props) {
  const { mutate, isPending } = useCreateSession();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: getCurrentAcademicYear(),
      is_current: true,
      terms: getDefaultTerms(getSessionStartYear()),
    },
  });

  // Watch the terms so the "current term" radio reflects live form state.
  const terms = useWatch({ control, name: "terms" });

  function setCurrentTerm(index: number) {
    terms.forEach((_, i) => setValue(`terms.${i}.is_current`, i === index));
  }

  function onInvalid() {
    const termsErr = errors.terms;
    const msg =
      (termsErr && "message" in termsErr && (termsErr.message as string)) ||
      errors.name?.message ||
      "Please check the term dates and try again.";
    toast.error(msg);
  }

  return (
    <form
      onSubmit={handleSubmit((v) => mutate(v, { onSuccess: onNext }), onInvalid)}
      noValidate
      className="space-y-6"
    >
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink" htmlFor="session-name">
          Academic session
        </label>
        <Input id="session-name" placeholder="e.g. 2025/2026" {...register("name")} />
        <p className="text-xs text-n-400">One academic year, split into three terms below.</p>
        <FieldErr msg={errors.name?.message} />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-ink">Terms</p>
        <div className="space-y-3">
          {terms.map((term, i) => (
            <div
              key={term.name}
              className="rounded-xl border border-n-200 p-3.5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-ink">{TERM_LABELS[term.name]}</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="current-term"
                    checked={term.is_current}
                    onChange={() => setCurrentTerm(i)}
                    className="accent-brand"
                  />
                  <span className={term.is_current ? "text-brand font-medium" : "text-n-400"}>
                    Current term
                  </span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-n-500" htmlFor={`term-${i}-start`}>
                    Start date
                  </label>
                  <Input
                    id={`term-${i}-start`}
                    type="date"
                    className="h-9"
                    {...register(`terms.${i}.start_date`)}
                  />
                  <FieldErr msg={errors.terms?.[i]?.start_date?.message} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-n-500" htmlFor={`term-${i}-end`}>
                    End date
                  </label>
                  <Input
                    id={`term-${i}-end`}
                    type="date"
                    className="h-9"
                    {...register(`terms.${i}.end_date`)}
                  />
                  <FieldErr msg={errors.terms?.[i]?.end_date?.message} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.terms && "message" in errors.terms && (
          <p className="text-xs text-red-600">{errors.terms.message as string}</p>
        )}
      </div>

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
