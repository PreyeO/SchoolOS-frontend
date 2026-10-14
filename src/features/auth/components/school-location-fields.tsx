"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";

import type { CreateSchoolFormValues } from "../schemas/create-school-schema";
import { FieldWrapper } from "./field-wrapper";
import { Section, SectionLabel } from "./form-section";
import { StateSelect } from "./state-select";

interface Props {
  register: UseFormRegister<CreateSchoolFormValues>;
  errors: FieldErrors<CreateSchoolFormValues>;
}

// Where the school is and how to reach it. The two sections travel together
// because neither has any logic of its own — they're plain registered fields,
// and separating them from the form's stateful half (name/slug syncing,
// duplicate lookup, levels) is what keeps that half readable.
export function SchoolLocationFields({ register, errors }: Props) {
  return (
    <>
      <Section>
        <SectionLabel>Location</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldWrapper id="state" label="State" error={errors.state?.message} required>
            <StateSelect hasError={!!errors.state} {...register("state")} />
          </FieldWrapper>
          <FieldWrapper id="city" label="City" error={errors.city?.message} required>
            <Input id="city" {...register("city")} />
          </FieldWrapper>
        </div>
        <FieldWrapper id="address" label="Street address" error={errors.address?.message} required>
          <Input id="address" {...register("address")} />
        </FieldWrapper>
      </Section>

      <Section>
        <SectionLabel>Contact &amp; capacity</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldWrapper
            id="phone_number"
            label="School phone"
            error={errors.phone_number?.message}
            required
          >
            <Input id="phone_number" type="tel" inputMode="tel" {...register("phone_number")} />
          </FieldWrapper>
          {/* Deliberately does NOT say "you can update it later" like the email
              field: student_capacity is excluded from
              SchoolBrandingUpdateSerializer's whitelist (grouped with the
              billing fields), so there's no self-serve way to change it yet.
              What IS true is that nothing enforces it — no student-creation
              path checks it — so it's an estimate, not a cap. */}
          <FieldWrapper
            id="student_capacity"
            label="Student capacity"
            hint="An estimate is fine. It's for your plan, not a cap on how many students you can add."
            error={errors.student_capacity?.message}
            required
          >
            <Input
              id="student_capacity"
              type="number"
              inputMode="numeric"
              min={1}
              {...register("student_capacity", { valueAsNumber: true })}
            />
          </FieldWrapper>
        </div>
      </Section>
    </>
  );
}
