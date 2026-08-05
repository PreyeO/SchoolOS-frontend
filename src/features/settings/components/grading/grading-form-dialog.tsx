"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";

import { gradingSystemSchema, type GradingSystemFormValues } from "../../schemas/grading-schema";
import { GradeComponentsField } from "./grade-components-field";
import { GradeRangesField } from "./grade-ranges-field";

interface Props {
  trigger: React.ReactNode;
  title: string;
  initialValues: GradingSystemFormValues;
  // Only offered (and editable) on create — level can't change after that.
  availableLevels?: SchoolLevelValue[];
  isPending?: boolean;
  onSave: (values: GradingSystemFormValues) => Promise<unknown>;
}

export function GradingFormDialog({ trigger, title, initialValues, availableLevels, isPending, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const isCreate = !!availableLevels;

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<GradingSystemFormValues>({
    resolver: zodResolver(gradingSystemSchema),
    defaultValues: initialValues,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(initialValues);
  }

  function onInvalid() {
    const first =
      errors.level?.message ??
      errors.components?.message ??
      errors.ranges?.message ??
      "Please check the form and try again.";
    toast.error(first);
  }

  async function submit(values: GradingSystemFormValues) {
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit, onInvalid)} noValidate className="space-y-5">
          {isCreate ? (
            <FieldWrapper id="grading-level" label="School level" error={errors.level?.message}>
              <select
                id="grading-level"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register("level")}
              >
                <option value="">Choose a level…</option>
                {availableLevels.map((value) => (
                  <option key={value} value={value}>
                    {SCHOOL_LEVELS.find((l) => l.value === value)?.label ?? value}
                  </option>
                ))}
              </select>
            </FieldWrapper>
          ) : null}

          <GradeComponentsField control={control} register={register} errors={errors} />
          <GradeRangesField control={control} register={register} errors={errors} />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
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
