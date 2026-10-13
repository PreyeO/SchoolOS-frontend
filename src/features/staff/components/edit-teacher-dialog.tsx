"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { SelectField, TextField } from "@/features/students/components/student-field";

import { useUpdateTeacher } from "../hooks/use-update-teacher";
import { teacherTypeLabel } from "../lib/teacher-type-label";
import { teacherEditSchema, teacherTypeBlocker, toTeacherPayload, type TeacherEditValues } from "../schemas/teacher-edit-schema";

const TYPE_OPTIONS = (["class", "subject", "both"] as const).map((value) => ({ value, label: teacherTypeLabel(value) }));

interface Props {
  teacherId: string;
  initial: TeacherEditValues;
  // "admin": an edit_staff admin on /staff/:id, editing everything.
  // "self": the teacher on /profile — name and phone only, because any
  // staff-record key in the body 403s the whole request.
  mode: "admin" | "self";
  // Admin mode only: what stands in the way of a teacher_type change.
  counts?: { subjectAssignments: number; classesLed: number };
  trigger: React.ReactNode;
}

export function EditTeacherDialog({ teacherId, initial, mode, counts, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const update = useUpdateTeacher(teacherId);
  const isAdmin = mode === "admin";

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<TeacherEditValues>({
    resolver: zodResolver(teacherEditSchema),
    defaultValues: initial,
  });
  // useWatch, not watch(): the React Compiler can't memoize watch() safely.
  const nextType = useWatch({ control, name: "teacher_type" });

  const blocker = isAdmin && counts ? teacherTypeBlocker(initial.teacher_type, nextType, counts) : null;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(initial);
  }

  async function submit(values: TeacherEditValues) {
    const payload = toTeacherPayload(values, initial, isAdmin);
    if (Object.keys(payload).length === 0) {
      setOpen(false);
      return;
    }
    try {
      await update.mutateAsync(payload);
      setOpen(false);
    } catch {
      // Already toasted — including the teacher_type guards, verbatim.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isAdmin ? "Edit teacher" : "Edit your details"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="teacher-first" label="First name" error={errors.first_name} registration={register("first_name")} />
            <TextField id="teacher-last" label="Last name" error={errors.last_name} registration={register("last_name")} />
            <TextField
              id="teacher-phone"
              label="Phone number"
              type="tel"
              hint="International format, e.g. +2348012345678. Leave blank to remove."
              error={errors.phone_number}
              registration={register("phone_number")}
            />
          </div>

          {isAdmin && (
            <div className="grid gap-4 border-t border-n-100 pt-4 sm:grid-cols-2">
              <TextField id="teacher-employee-id" label="Employee ID" error={errors.employee_id} registration={register("employee_id")} />
              <SelectField
                id="teacher-type"
                label="Type"
                options={TYPE_OPTIONS}
                error={errors.teacher_type}
                registration={register("teacher_type")}
              />
              <TextField id="teacher-qualification" label="Qualification" error={errors.qualification} registration={register("qualification")} />
              <TextField id="teacher-specialization" label="Specialization" error={errors.specialization} registration={register("specialization")} />
            </div>
          )}

          {blocker && (
            <p role="alert" className="rounded-md border border-amber/40 bg-amber/10 px-2.5 py-2 text-xs text-ink">
              {blocker}
            </p>
          )}

          {!isAdmin && (
            <p className="text-xs text-n-400">
              Your employee ID, qualification and teaching type are kept by the school. Ask an
              administrator to change them.
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            {/* The blocker warns but doesn't disable: the server ignores
                assignments on retired arms, and the assignments list doesn't
                say whether an arm is retired, so this count can be high. The
                server's own 400 is the final word. */}
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
