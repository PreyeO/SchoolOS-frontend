"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { FieldWrapper } from "@/features/auth/components/field-wrapper";

import { periodSchema, type PeriodFormValues } from "../../schemas/review-edit-schemas";

interface Props {
  trigger: React.ReactNode;
  title: string;
  initialValues: PeriodFormValues;
  isPending?: boolean;
  onSave: (values: PeriodFormValues) => Promise<unknown>;
}

// Shared by both "edit an existing period" and "add a period" — same fields
// either way (name/start_date/end_date/is_current); order is always
// auto-assigned client-side, never exposed here.
export function EditPeriodDialog({ trigger, title, initialValues, isPending, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PeriodFormValues>({ resolver: zodResolver(periodSchema), defaultValues: initialValues });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(initialValues);
  }

  async function submit(values: PeriodFormValues) {
    try {
      await onSave(values);
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FieldWrapper id="period-name" label="Term name" error={errors.name?.message}>
            <Input
              id="period-name"
              placeholder="e.g. 1st Term"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "period-name-error" : undefined}
              {...register("name")}
            />
          </FieldWrapper>
          <div className="grid grid-cols-2 gap-3">
            <FieldWrapper id="period-start" label="Start date" error={errors.start_date?.message}>
              <Input
                id="period-start"
                type="date"
                aria-invalid={!!errors.start_date}
                aria-describedby={errors.start_date ? "period-start-error" : undefined}
                {...register("start_date")}
              />
            </FieldWrapper>
            <FieldWrapper id="period-end" label="End date" error={errors.end_date?.message}>
              <Input
                id="period-end"
                type="date"
                aria-invalid={!!errors.end_date}
                aria-describedby={errors.end_date ? "period-end-error" : undefined}
                {...register("end_date")}
              />
            </FieldWrapper>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" className="accent-primary" {...register("is_current")} />
            Current term
          </label>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
