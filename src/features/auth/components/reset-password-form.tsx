"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas/reset-password-schema";
import { useResetPassword } from "../hooks/use-reset-password";
import { FieldWrapper } from "./field-wrapper";
import { PasswordInput } from "./password-input";
import { ResendPasswordResetButton } from "./resend-password-reset-button";

interface Props {
  email: string;
}

export function ResetPasswordForm({ email }: Props) {
  const { mutate, isPending } = useResetPassword(email);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", password: "", confirm_password: "" },
  });

  return (
    <form onSubmit={handleSubmit((v) => mutate(v))} noValidate className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium text-ink">Reset code</p>
        <Controller
          name="otp"
          control={control}
          render={({ field }) => (
            <InputOTP
              maxLength={6}
              value={field.value}
              onChange={field.onChange}
              aria-label="6-digit reset code"
              aria-invalid={!!errors.otp}
              aria-describedby={errors.otp ? "otp-error" : undefined}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} className="size-11 text-base" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        />
        {errors.otp && (
          <p id="otp-error" role="alert" className="text-xs text-red-600">
            {errors.otp.message}
          </p>
        )}
      </div>

      <FieldWrapper id="password" label="New password" error={errors.password?.message} required>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          hasError={!!errors.password}
          describedBy={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
      </FieldWrapper>

      <FieldWrapper
        id="confirm_password"
        label="Confirm new password"
        error={errors.confirm_password?.message}
        required
      >
        <PasswordInput
          id="confirm_password"
          autoComplete="new-password"
          hasError={!!errors.confirm_password}
          describedBy={errors.confirm_password ? "confirm_password-error" : undefined}
          {...register("confirm_password")}
        />
      </FieldWrapper>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-amber hover:bg-amber/90 text-ink font-semibold text-base"
      >
        {isPending ? "Resetting…" : "Reset password"}
      </Button>

      <div className="text-center">
        <ResendPasswordResetButton email={email} />
      </div>
    </form>
  );
}
