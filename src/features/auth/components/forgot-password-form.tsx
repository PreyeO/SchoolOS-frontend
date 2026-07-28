"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas/forgot-password-schema";
import { useForgotPassword } from "../hooks/use-forgot-password";
import { FieldWrapper } from "./field-wrapper";

export function ForgotPasswordForm() {
  const { mutate, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <form onSubmit={handleSubmit((v) => mutate(v.email))} noValidate className="space-y-5">
      <FieldWrapper id="email" label="Email address" error={errors.email?.message} required>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
      </FieldWrapper>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-amber hover:bg-amber/90 text-ink font-semibold text-base"
      >
        {isPending ? "Sending…" : "Send reset code"}
      </Button>
    </form>
  );
}
