"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

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
import { useSchoolLevels } from "@/lib/school/use-school-levels";

import { classesSchema, type ClassesFormValues } from "../../schemas/classes-schema";
import { useAddClass } from "../../hooks/use-class-mutations";
import { ClassRow } from "../class-row";

function blankClass(level: string): ClassesFormValues["classes"][number] {
  return { name: "", level, arms: [] };
}

// Reuses the exact same ClassRow + classesSchema pipeline as the onboarding
// Classes step, just constrained to a one-item form, so a school can add a
// single new class from Review without re-submitting its existing ones.
export function AddClassDialog() {
  const [open, setOpen] = useState(false);
  const { levels: schoolLevels } = useSchoolLevels();
  const addClass = useAddClass();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ClassesFormValues>({
    resolver: zodResolver(classesSchema),
    defaultValues: { classes: [blankClass(schoolLevels[0] ?? "primary")] },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset({ classes: [blankClass(schoolLevels[0] ?? "primary")] });
  }

  async function submit(values: ClassesFormValues) {
    try {
      await addClass.mutateAsync(values);
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="text-brand">
          <Plus className="size-4 mr-1" /> Add class
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <ClassRow
            control={control}
            register={register}
            errors={errors}
            classIndex={0}
            schoolLevels={schoolLevels}
            onRemoveClass={() => reset({ classes: [blankClass(schoolLevels[0] ?? "primary")] })}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={addClass.isPending}>
              {addClass.isPending ? "Adding…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
