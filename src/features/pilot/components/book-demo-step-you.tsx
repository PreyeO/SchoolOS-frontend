"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { PILOT_ROLES } from "@/data/pilot";

import type { DemoRequestFormValues } from "../schemas/demo-request-schema";

interface Props {
  register: UseFormRegister<DemoRequestFormValues>;
  errors: FieldErrors<DemoRequestFormValues>;
}

export function BookDemoStepYou({ register, errors }: Props) {
  return (
    <>
      <FieldWrapper id="full_name" label="Full name" error={errors.full_name?.message} required>
        <Input
          id="full_name"
          autoComplete="name"
          aria-invalid={!!errors.full_name}
          aria-describedby={errors.full_name ? "full_name-error" : undefined}
          {...register("full_name")}
        />
      </FieldWrapper>

      <FieldWrapper id="role" label="Your role" error={errors.role?.message} required>
        <Select
          id="role"
          defaultValue=""
          aria-invalid={!!errors.role}
          aria-describedby={errors.role ? "role-error" : undefined}
          {...register("role")}
        >
          <option value="" disabled>
            Select your role
          </option>
          {PILOT_ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </FieldWrapper>
    </>
  );
}
