"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

import { editSubjectSchema, type EditSubjectFormValues } from "../../schemas/review-edit-schemas";

interface Props {
  trigger: React.ReactNode;
  initialValues: EditSubjectFormValues;
  schoolLevels: SchoolLevelValue[];
  isPending?: boolean;
  onSave: (values: EditSubjectFormValues) => Promise<unknown>;
}

export function EditSubjectDialog({ trigger, initialValues, schoolLevels, isPending, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const levelOptions = SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditSubjectFormValues>({ resolver: zodResolver(editSubjectSchema), defaultValues: initialValues });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(initialValues);
  }

  async function submit(values: EditSubjectFormValues) {
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
          <DialogTitle>Edit subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FieldWrapper id="subject-name" label="Subject name" error={errors.name?.message}>
            <Input
              id="subject-name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "subject-name-error" : undefined}
              {...register("name")}
            />
          </FieldWrapper>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink" htmlFor="subject-level">
              Level
            </label>
            <Select
              id="subject-level"
              {...register("level")}>
              {levelOptions.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" className="accent-primary" {...register("is_core")} />
            Core subject
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
