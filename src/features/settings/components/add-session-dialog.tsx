"use client";

import { useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { FieldErrors } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getCurrentAcademicYear, getDefaultTerms, getSessionStartYear } from "@/data/term-defaults";
import {
  academicYearSchema,
  type AcademicYearFormValues,
} from "@/features/onboarding/schemas/academic-year-schema";
import { PeriodRow } from "@/features/onboarding/components/period-row";
import { useAddSession } from "../hooks/use-add-session";

const DEFAULT_TERM_NAMES = ["1st Term", "2nd Term", "3rd Term"];

function defaultValues(): AcademicYearFormValues {
  return {
    name: getCurrentAcademicYear(),
    periods: getDefaultTerms(getSessionStartYear()).map((t, i) => ({
      name: DEFAULT_TERM_NAMES[i],
      start_date: t.start_date,
      end_date: t.end_date,
      is_current: t.is_current,
    })),
  };
}

// Reuses the exact onboarding academic-year form pipeline (schema, PeriodRow,
// term defaults) so a school can add another session from Settings the same
// way onboarding's Academic Year step works.
export function AddSessionDialog() {
  const [open, setOpen] = useState(false);
  const addSession = useAddSession();
  const newRowRef = useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: defaultValues(),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "periods" });
  const periods = useWatch({ control, name: "periods" });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(defaultValues());
  }

  function setCurrentPeriod(index: number) {
    periods.forEach((_, i) => setValue(`periods.${i}.is_current`, i === index));
  }

  function addPeriod() {
    append({ name: "", start_date: "", end_date: "", is_current: false });
    requestAnimationFrame(() => newRowRef.current?.focus());
  }

  function onInvalid(formErrors: FieldErrors<AcademicYearFormValues>) {
    const periodsErr = formErrors.periods;
    const rootMsg = periodsErr && "message" in periodsErr ? (periodsErr.message as string) : undefined;
    toast.error(rootMsg ?? formErrors.name?.message ?? "Please check the term dates and try again.");
  }

  async function submit(values: AcademicYearFormValues) {
    try {
      await addSession.mutateAsync(values);
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="text-brand">
          <Plus className="size-4 mr-1" /> Add session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add an academic session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit, onInvalid)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink" htmlFor="session-name">
              Session name
            </label>
            <Input
              id="session-name"
              placeholder="e.g. 2026/2027"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && <p role="alert" className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

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

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={addSession.isPending}>
              {addSession.isPending ? "Adding…" : "Add session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
