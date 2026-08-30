"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { CONTACT_TIMES, PILOT_COPY, PILOT_ROLES } from "@/data/pilot";

import { useSubmitDemoRequest } from "../hooks/use-submit-demo-request";
import { demoRequestSchema, type DemoRequestFormValues } from "../schemas/demo-request-schema";
import type { DemoRequestPayload, PilotRole, StudentRange, ContactTime } from "../types";
import type { SchoolLevel } from "@/features/auth/types";
import { BookDemoSchoolFields } from "./book-demo-school-fields";

export function BookDemoForm({ onDone }: { onDone: (firstName: string) => void }) {
  const { mutate, isPending } = useSubmitDemoRequest();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DemoRequestFormValues>({
    resolver: zodResolver(demoRequestSchema),
    // +234 prefilled rather than a placeholder: it's the answer for almost
    // every visitor, and a placeholder would have to be retyped.
    defaultValues: { levels: [], phone_number: "+234" },
  });

  function submit(values: DemoRequestFormValues) {
    const payload: DemoRequestPayload = {
      full_name: values.full_name.trim(),
      role: values.role as PilotRole,
      phone_number: values.phone_number.replace(/[\s-]/g, ""),
      email: values.email.trim(),
      school_name: values.school_name.trim(),
      state: values.state,
      city: values.city.trim(),
      levels: values.levels as SchoolLevel[],
      student_range: values.student_range as StudentRange,
      // Omitted when unanswered rather than sent empty.
      ...(values.best_time_to_call
        ? { best_time_to_call: values.best_time_to_call as ContactTime }
        : {}),
    };
    mutate(payload, { onSuccess: () => onDone(payload.full_name.split(" ")[0]) });
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <p className="text-sm text-n-500">{PILOT_COPY.formIntro}</p>

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

      {/* inputMode="tel" opens the numeric keypad without type="tel"'s habit of
          stripping the leading +, which this field depends on. */}
      <FieldWrapper
        id="phone_number"
        label="Phone number (WhatsApp)"
        hint="This is how we'll reach you."
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

      <BookDemoSchoolFields register={register} control={control} errors={errors} />

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

      <Button type="submit" disabled={isPending} className="h-11 w-full font-semibold">
        {isPending ? "Sending…" : "Join the pilot"}
      </Button>
    </form>
  );
}
