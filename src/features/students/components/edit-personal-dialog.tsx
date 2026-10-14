"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useUpdateStudent } from "../hooks/use-update-student";
import { BLOOD_GROUP_OPTIONS, GENOTYPE_OPTIONS, RELIGION_OPTIONS } from "../lib/labels";
import { personalSchema, toPayload, type PersonalFormValues } from "../schemas/student-edit-schema";
import type { StudentDetail } from "../types";
import { SelectField, TextAreaField, TextField } from "./student-field";
import { StudentEditShell } from "./student-edit-shell";

// The medical half of this is the reason ANY teacher can edit a student, not
// only admins holding edit_students — see useCanEditStudent.
export function EditPersonalDialog({ student }: { student: StudentDetail }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateStudent(student.id);

  const defaults: PersonalFormValues = {
    state_of_origin: student.state_of_origin ?? "",
    religion: student.religion ?? "",
    blood_group: student.blood_group ?? "",
    genotype: student.genotype ?? "",
    allergies: student.allergies ?? "",
    chronic_conditions: student.chronic_conditions ?? "",
    disabilities: student.disabilities ?? "",
    emergency_medications: student.emergency_medications ?? "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalFormValues>({ resolver: zodResolver(personalSchema), defaultValues: defaults });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset(defaults);
  }

  async function submit(values: PersonalFormValues) {
    try {
      await update.mutateAsync(toPayload(values));
      setOpen(false);
    } catch {
      // Already toasted by the mutation.
    }
  }

  return (
    <StudentEditShell
      title="Edit personal & medical details"
      studentName={`${student.user.first_name} ${student.user.last_name}`}
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit(submit)}
      isPending={update.isPending}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id="edit-state"
          label="State of origin"
          error={errors.state_of_origin}
          registration={register("state_of_origin")}
        />
        {/* All three carry a "Not recorded" option: unknown is a real and common
            answer for a newly admitted child, and is different from picking the
            model's own "unknown" value, which asserts someone checked. */}
        <SelectField
          id="edit-religion"
          label="Religion"
          options={RELIGION_OPTIONS}
          placeholder="Not recorded"
          error={errors.religion}
          registration={register("religion")}
        />
        <SelectField
          id="edit-blood-group"
          label="Blood group"
          options={BLOOD_GROUP_OPTIONS}
          placeholder="Not recorded"
          error={errors.blood_group}
          registration={register("blood_group")}
        />
        <SelectField
          id="edit-genotype"
          label="Genotype"
          options={GENOTYPE_OPTIONS}
          placeholder="Not recorded"
          error={errors.genotype}
          registration={register("genotype")}
        />
      </div>

      <TextAreaField
        id="edit-allergies"
        label="Allergies"
        error={errors.allergies}
        registration={register("allergies")}
        hint="Anything staff must know before giving food or medication."
      />
      <TextAreaField
        id="edit-chronic"
        label="Chronic conditions"
        error={errors.chronic_conditions}
        registration={register("chronic_conditions")}
      />
      <TextAreaField
        id="edit-disabilities"
        label="Disabilities"
        error={errors.disabilities}
        registration={register("disabilities")}
      />
      <TextAreaField
        id="edit-medications"
        label="Emergency medications"
        error={errors.emergency_medications}
        registration={register("emergency_medications")}
      />
    </StudentEditShell>
  );
}
