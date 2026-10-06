"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { COUNTRIES } from "@/data/countries";

import { useUpdateStudent } from "../hooks/use-update-student";
import { ENROLLMENT_STATUS_OPTIONS, GENDER_OPTIONS } from "../lib/labels";
import { admissionSchema, toPayload, type AdmissionFormValues } from "../schemas/student-edit-schema";
import type { StudentDetail } from "../types";
import { SelectField, TextField } from "./student-field";
import { StudentEditShell } from "./student-edit-shell";

// Admission number is absent on purpose — it's excluded from the backend's
// whitelist, because it identifies the student across the whole school.
export function EditAdmissionDialog({ student }: { student: StudentDetail }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateStudent(student.id);

  const defaults: AdmissionFormValues = {
    // The form only offers male/female, but a legacy record may still hold
    // "other". It falls back to the first option so the select shows what will
    // actually be saved, rather than a blank the schema would then reject.
    gender: student.gender === "female" ? "female" : "male",
    enrollment_status: student.enrollment_status,
    // <input type="date"> needs "" for empty, never null.
    date_of_birth: student.date_of_birth ?? "",
    date_of_admission: student.date_of_admission ?? "",
    nationality: student.nationality ?? "",
    previous_school: student.previous_school ?? "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdmissionFormValues>({ resolver: zodResolver(admissionSchema), defaultValues: defaults });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(defaults);
  }

  async function submit(values: AdmissionFormValues) {
    try {
      await update.mutateAsync(toPayload(values));
      setOpen(false);
    } catch {
      // Already toasted by the mutation.
    }
  }

  return (
    <StudentEditShell
      title="Edit admission details"
      studentName={`${student.user.first_name} ${student.user.last_name}`}
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit(submit)}
      isPending={update.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="edit-gender"
          label="Gender"
          options={GENDER_OPTIONS}
          error={errors.gender}
          registration={register("gender")}
        />
        <SelectField
          id="edit-enrollment-status"
          label="Enrollment status"
          options={ENROLLMENT_STATUS_OPTIONS}
          error={errors.enrollment_status}
          registration={register("enrollment_status")}
          hint="Whether they're still in a class — separate from whether they can sign in."
        />
        <TextField
          id="edit-dob"
          label="Date of birth"
          type="date"
          error={errors.date_of_birth}
          registration={register("date_of_birth")}
        />
        <TextField
          id="edit-doa"
          label="Added to SchoolOS"
          type="date"
          error={errors.date_of_admission}
          registration={register("date_of_admission")}
        />
        {/* A dropdown, not free text: the backend stores a 2-letter country
            code and rejects anything else, so a typed "Nigeria" would 400. */}
        <SelectField
          id="edit-nationality"
          label="Nationality"
          options={COUNTRIES}
          placeholder="Not recorded"
          error={errors.nationality}
          registration={register("nationality")}
        />
        <TextField
          id="edit-previous-school"
          label="Previous school"
          error={errors.previous_school}
          registration={register("previous_school")}
        />
      </div>
    </StudentEditShell>
  );
}
