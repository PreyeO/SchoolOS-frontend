"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { PasswordInput } from "@/features/auth/components/password-input";

import type { AddStudentFormValues } from "../schemas/add-student-schema";

interface Props {
  register: UseFormRegister<AddStudentFormValues>;
  errors: FieldErrors<AddStudentFormValues>;
}

// Who the student is. Separated from the enrolment half, which is where the
// two server-side blockers live and needs the class list.
//
// Email is optional because the backend mints a synthetic internal address
// (student.{admission}.{school}@internal.myschoolos.io) when it's blank — most
// primary pupils have no email of their own, and demanding one would push
// admins into inventing them.
export function StudentIdentityFields({ register, errors }: Props) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper
          id="student-first-name"
          label="First name"
          error={errors.first_name?.message}
          required
        >
          <Input id="student-first-name" autoComplete="given-name" {...register("first_name")} />
        </FieldWrapper>
        <FieldWrapper
          id="student-last-name"
          label="Last name"
          error={errors.last_name?.message}
          required
        >
          <Input id="student-last-name" autoComplete="family-name" {...register("last_name")} />
        </FieldWrapper>
      </div>

      <FieldWrapper
        id="student-admission"
        label="Admission number"
        error={errors.admission_number?.message}
        required
      >
        <Input
          id="student-admission"
          placeholder="e.g. MOUAU/EEE/16/93164"
          {...register("admission_number")}
        />
      </FieldWrapper>

      <FieldWrapper id="student-password" label="Password" error={errors.password?.message} required>
        <PasswordInput
          id="student-password"
          autoComplete="new-password"
          hasError={!!errors.password}
          describedBy={errors.password ? "student-password-error" : undefined}
          {...register("password")}
        />
      </FieldWrapper>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper id="student-gender" label="Gender" error={errors.gender?.message} required>
          <Select id="student-gender" {...register("gender")}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </FieldWrapper>
        <FieldWrapper
          id="student-dob"
          label="Date of birth"
          error={errors.date_of_birth?.message}
          hint="Optional"
        >
          <Input id="student-dob" type="date" {...register("date_of_birth")} />
        </FieldWrapper>
      </div>

      <FieldWrapper
        id="student-email"
        label="Email"
        error={errors.email?.message}
        hint="Optional — leave blank to use a generated school email"
      >
        <Input id="student-email" type="email" {...register("email")} />
      </FieldWrapper>
    </>
  );
}
