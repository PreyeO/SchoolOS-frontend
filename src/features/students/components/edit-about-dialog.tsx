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
export function EditAboutDialog({ student }: { student: StudentDetail }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateStudent(student.id);

  const defaults: AboutFormValues = {
    favourite_food: student.favourite_food ?? "",
    hobbies: student.hobbies ?? "",
    ambitions: student.ambitions ?? "",
    photo: student.photo ?? "",
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
      {/* A URL, not an upload — the model stores a link and there is no
          multipart path for student photos anywhere in the API. */}
      <TextField
        id="edit-photo"
        label="Photo URL"
        error={errors.photo}
        registration={register("photo")}
        hint="Link to an image hosted elsewhere. Leave blank to use their initials."
      />
    </StudentEditShell>
  );
}
