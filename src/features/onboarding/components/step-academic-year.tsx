"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentAcademicYear, TERM_COUNT_OPTIONS } from "@/data/term-defaults";

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

  const { register, handleSubmit, formState: { errors } } = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: getCurrentAcademicYear(),
      start_date: "",
      end_date: "",
      term_count: 3,
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => mutate(v, { onSuccess: onNext }))} noValidate className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink" htmlFor="session-name">
          Academic year / session name
        </label>
        <Input id="session-name" placeholder="e.g. 2024/2025" {...register("name")} />
        <FieldErr msg={errors.name?.message} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink" htmlFor="start-date">Start date</label>
          <Input id="start-date" type="date" {...register("start_date")} />
          <FieldErr msg={errors.start_date?.message} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink" htmlFor="end-date">End date</label>
          <Input id="end-date" type="date" {...register("end_date")} />
          <FieldErr msg={errors.end_date?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-ink">Term structure</p>
        <div className="flex gap-3">
          {TERM_COUNT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={opt.value}
                {...register("term_count", { valueAsNumber: true })}
                className="accent-brand"
              />
              <span className="text-sm text-ink">{opt.label}</span>
            </label>
          ))}
        </div>
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
