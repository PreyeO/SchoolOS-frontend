"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { cn } from "@/lib/utils";
import { CONTACT_METHODS, CONTACT_TIMES } from "@/data/pilot";

import type { DemoRequestFormValues } from "../schemas/demo-request-schema";
import type { ContactMethod } from "../types";

interface Props {
  register: UseFormRegister<DemoRequestFormValues>;
  errors: FieldErrors<DemoRequestFormValues>;
  method: ContactMethod | "";
  onMethodChange: (method: ContactMethod) => void;
}

// Pick a channel, then give only the detail that channel needs. Asking for both
// an email and a phone number when we'll only ever use one of them is the kind
// of over-ask that costs completions on a marketing form.
export function BookDemoStepContact({ register, errors, method, onMethodChange }: Props) {
  const selected = CONTACT_METHODS.find((m) => m.value === method);
  const isEmail = selected?.field === "email";

  return (
    <>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">
          How should we reach you? <span className="text-clay">*</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {CONTACT_METHODS.map((m) => (
            <label
              key={m.value}
              className={cn(
                "flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-sm transition-colors",
                method === m.value
                  ? "border-primary bg-primary/5 font-medium text-ink"
                  : "border-n-200 text-n-600 hover:border-n-300",
              )}
            >
              <input
                type="radio"
                value={m.value}
                className="sr-only"
                {...register("contact_method", {
                  onChange: (e) => onMethodChange(e.target.value as ContactMethod),
                })}
              />
              {m.label}
            </label>
          ))}
        </div>
        {errors.contact_method?.message && (
          <p role="alert" className="mt-1.5 text-xs text-red-600">
            {errors.contact_method.message}
          </p>
        )}
      </fieldset>

      {/* Only appears once a channel is chosen, so the step opens as one
          question rather than three. */}
      {selected && (
        <FieldWrapper
          id={isEmail ? "email" : "phone_number"}
          label={selected.inputLabel}
          hint={selected.hint}
          error={isEmail ? errors.email?.message : errors.phone_number?.message}
          required
        >
          {isEmail ? (
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
          ) : (
            // inputMode="tel" gives the numeric keypad without type="tel"'s
            // habit of stripping the leading +, which this field depends on.
            <Input
              id="phone_number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={!!errors.phone_number}
              aria-describedby={errors.phone_number ? "phone_number-error" : undefined}
              {...register("phone_number")}
            />
          )}
        </FieldWrapper>
      )}

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
    </>
  );
}
