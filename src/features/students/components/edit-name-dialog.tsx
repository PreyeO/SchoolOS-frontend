"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { nameField } from "@/features/invitations/schemas/shared";

import { useUpdateStudent } from "../hooks/use-update-student";
import type { StudentDetail } from "../types";
import { TextField } from "./student-field";
import { StudentEditShell } from "./student-edit-shell";

// Same name rule as the add-student form, so a corrected name can't fail a
// check the original passed.
const nameSchema = z.object({ first_name: nameField, last_name: nameField });
type NameValues = z.infer<typeof nameSchema>;

// A typo fix, sent on the ordinary profile PATCH (/students/<id>/) since
// 2026-10-13, when the separate update-name/ route was removed. That makes
// it available to the same people as the rest of the profile: an admin with
// edit_students, or any teacher (useCanEditStudent). Kept as its own dialog
// in the header, not a field on a card, because the name is the header.
export function EditNameDialog({ student }: { student: StudentDetail }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateStudent(student.id);
  const defaults: NameValues = { first_name: student.user.first_name, last_name: student.user.last_name };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NameValues>({ resolver: zodResolver(nameSchema), defaultValues: defaults });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(defaults);
  }

  async function submit(values: NameValues) {
    try {
      // Trimmed: a pasted trailing space would otherwise become part of the
      // stored name and every report card printed from it.
      await update.mutateAsync({ first_name: values.first_name.trim(), last_name: values.last_name.trim() });
      setOpen(false);
    } catch {
      // Already toasted by the mutation.
    }
  }

  return (
    <StudentEditShell
      title="Correct name"
      studentName={`${student.user.first_name} ${student.user.last_name}`}
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit(submit)}
      isPending={update.isPending}
      trigger={
        <Button type="button" variant="outline" size="sm">
          Correct name
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="name-first" label="First name" error={errors.first_name} registration={register("first_name")} />
        <TextField id="name-last" label="Last name" error={errors.last_name} registration={register("last_name")} />
      </div>
      <p className="text-xs text-n-400">For fixing a typo or import mistake. The change is audited.</p>
    </StudentEditShell>
  );
}
