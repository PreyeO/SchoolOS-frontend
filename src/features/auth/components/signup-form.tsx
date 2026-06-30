"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { signupSchema, type SignupFormValues } from "../schemas/signup-schema";
import { useSignup } from "../hooks/use-signup";
import { FieldWrapper } from "./field-wrapper";
import { PasswordInput } from "./password-input";

export function SignupForm() {
  const { mutate, isPending } = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  function onSubmit(values: SignupFormValues) {
    mutate(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper id="first_name" label="First name" error={errors.first_name?.message} required>
          <Input
            id="first_name"
            autoComplete="given-name"
            aria-invalid={!!errors.first_name}
            aria-describedby={errors.first_name ? "first_name-error" : undefined}
            {...register("first_name")}
          />
        </FieldWrapper>

        <FieldWrapper id="last_name" label="Last name" error={errors.last_name?.message} required>
          <Input
            id="last_name"
            autoComplete="family-name"
            aria-invalid={!!errors.last_name}
            aria-describedby={errors.last_name ? "last_name-error" : undefined}
            {...register("last_name")}
          />
        </FieldWrapper>
      </div>

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

      <FieldWrapper id="password" label="Password" error={errors.password?.message} required>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          hasError={!!errors.password}
          describedBy={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
      </FieldWrapper>

      <FieldWrapper id="confirm_password" label="Confirm password" error={errors.confirm_password?.message} required>
        <PasswordInput
          id="confirm_password"
          autoComplete="new-password"
          hasError={!!errors.confirm_password}
          describedBy={errors.confirm_password ? "confirm_password-error" : undefined}
          {...register("confirm_password")}
        />
      </FieldWrapper>

      <FieldWrapper id="phone_number" label="Phone number" error={errors.phone_number?.message}>
        <Input
          id="phone_number"
          type="tel"
          autoComplete="tel"
          placeholder="+234 800 000 0000"
          aria-invalid={!!errors.phone_number}
          aria-describedby={errors.phone_number ? "phone_number-error" : undefined}
          {...register("phone_number")}
        />
      </FieldWrapper>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-amber hover:bg-amber/90 text-ink font-semibold text-base"
      >
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
