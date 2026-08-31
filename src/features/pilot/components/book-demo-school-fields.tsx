"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { LevelsSelect } from "@/features/auth/components/levels-select";
import { StateSelect } from "@/features/auth/components/state-select";
import type { SchoolLevel } from "@/features/auth/types";
import { STUDENT_RANGES } from "@/data/pilot";

import type { DemoRequestFormValues } from "../schemas/demo-request-schema";

interface Props {
  register: UseFormRegister<DemoRequestFormValues>;
  control: Control<DemoRequestFormValues>;
  errors: FieldErrors<DemoRequestFormValues>;
}

// The school half of the form. Split from the person half at the seam the page
// itself uses, which also keeps both files readable in one screen.
//
// StateSelect and LevelsSelect are the onboarding components unchanged — the
// same 36+FCT list and the same five level values the rest of the app stores,
// so a pilot signup can't describe a school in terms the product doesn't use.
export function BookDemoSchoolFields({ register, control, errors }: Props) {
  return (
    <>
      <FieldWrapper id="school_name" label="School name" error={errors.school_name?.message} required>
        <Input
          id="school_name"
          autoComplete="organization"
          aria-invalid={!!errors.school_name}
          aria-describedby={errors.school_name ? "school_name-error" : undefined}
          {...register("school_name")}
        />
      </FieldWrapper>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper id="state" label="State" error={errors.state?.message} required>
          <StateSelect
            id="state"
            hasError={!!errors.state}
            aria-invalid={!!errors.state}
            aria-describedby={errors.state ? "state-error" : undefined}
            {...register("state")}
          />
        </FieldWrapper>
        <FieldWrapper id="city" label="City / LGA" error={errors.city?.message} required>
          <Input
            id="city"
            autoComplete="address-level2"
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? "city-error" : undefined}
            {...register("city")}
          />
        </FieldWrapper>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ink">
          Levels your school runs <span className="text-clay">*</span>
        </legend>
        {/* Said explicitly: the cards look like a single choice, and a school
            that runs nursery through SSS should tick all four. */}
        <p className="mb-2 mt-0.5 text-xs text-n-500">Choose all that apply.</p>
        <Controller
          name="levels"
          control={control}
          render={({ field }) => (
            <LevelsSelect
              value={(field.value as SchoolLevel[]) ?? []}
              onChange={field.onChange}
              error={errors.levels?.message as string | undefined}
            />
          )}
        />
      </fieldset>

      <FieldWrapper
        id="student_range"
        label="Approximate number of students"
        error={errors.student_range?.message}
        required
      >
        <Select
          id="student_range"
          aria-invalid={!!errors.student_range}
          aria-describedby={errors.student_range ? "student_range-error" : undefined}
          defaultValue=""
          {...register("student_range")}
        >
          <option value="" disabled>
            Select a range
          </option>
          {STUDENT_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </FieldWrapper>
    </>
  );
}
