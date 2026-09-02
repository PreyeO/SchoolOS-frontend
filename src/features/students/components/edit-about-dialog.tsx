"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useUpdateStudent } from "../hooks/use-update-student";
import { aboutSchema, toPayload, type AboutFormValues } from "../schemas/student-edit-schema";
import type { StudentDetail } from "../types";
import { TextAreaField, TextField } from "./student-field";
import { StudentEditShell } from "./student-edit-shell";

// The soft details. These feed the nursery and primary report cards, which is
// why favourite food and ambitions are stored at all — they're not decoration.
//
// The photo is NOT here, despite sharing this PATCH's whitelist. It lives on
// the avatar itself (EditStudentPhotoDialog) — a photo field buried under
// "About", between hobbies and ambitions, is somewhere nobody thinks to look.
export function EditAboutDialog({ student }: { student: StudentDetail }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateStudent(student.id);

  const defaults: AboutFormValues = {
    favourite_food: student.favourite_food ?? "",
    hobbies: student.hobbies ?? "",
    ambitions: student.ambitions ?? "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AboutFormValues>({ resolver: zodResolver(aboutSchema), defaultValues: defaults });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(defaults);
  }

  async function submit(values: AboutFormValues) {
    try {
      await update.mutateAsync(toPayload(values));
      setOpen(false);
    } catch {
      // Already toasted by the mutation.
    }
  }

  return (
    <StudentEditShell
      title="Edit about"
      studentName={`${student.user.first_name} ${student.user.last_name}`}
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit(submit)}
      isPending={update.isPending}
    >
      <TextField
        id="edit-favourite-food"
        label="Favourite food"
        error={errors.favourite_food}
        registration={register("favourite_food")}
      />
      <TextAreaField
        id="edit-hobbies"
        label="Hobbies"
        error={errors.hobbies}
        registration={register("hobbies")}
      />
      <TextAreaField
        id="edit-ambitions"
        label="Ambitions"
        error={errors.ambitions}
        registration={register("ambitions")}
      />
    </StudentEditShell>
  );
}
