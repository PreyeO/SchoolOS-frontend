"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { CONTACT_TIMES } from "@/data/pilot";

import type { DemoRequestFormValues } from "../schemas/demo-request-schema";

interface Props {
  register: UseFormRegister<DemoRequestFormValues>;
  errors: FieldErrors<DemoRequestFormValues>;
}

export function BookDemoStepContact({ register, errors }: Props) {
  return (
    <>
      <FieldWrapper id="email" label="Email" error={errors.email?.message} required>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
      </FieldWrapper>

      {/* inputMode="tel" gives the numeric keypad without type="tel"'s habit of
          stripping the leading +, which this field depends on. */}
      <FieldWrapper
        id="phone_number"
        label="Phone number"
        error={errors.phone_number?.message}
        required
      >
        <Input
          id="phone_number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={!!errors.phone_number}
          aria-describedby={errors.phone_number ? "phone_number-error" : undefined}
          {...register("phone_number")}
        />
      </FieldWrapper>

      <FieldWrapper id="best_time_to_call" label="Best time to reach you (optional)">
        <Select id="best_time_to_call" defaultValue="" {...register("best_time_to_call")}>
          <option value="">Any time</option>
          {CONTACT_TIMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </FieldWrapper>

      {/* The only field that can carry something the form didn't think to ask.
          Last, and clearly optional, so it reads as an invitation rather than
          one more thing standing between them and the button. */}
      <FieldWrapper
        id="message"
        label="Anything else? (optional)"
        error={errors.message?.message}
      >
        <textarea
          id="message"
          rows={3}
          placeholder="Anything you'd like us to know before we call."
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className="w-full resize-y rounded-lg border border-n-200 bg-white px-3 py-2 text-base placeholder:text-n-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 md:text-sm"
          {...register("message")}
        />
      </FieldWrapper>
    </>
  );
}
