"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

import { verifyOtpSchema, type VerifyOtpFormValues } from "../schemas/verify-otp-schema";
import { useVerifyOtp } from "../hooks/use-verify-otp";
import { ResendOtpButton } from "./resend-otp-button";

interface OtpFormProps {
  email: string;
}

export function OtpForm({ email }: OtpFormProps) {
  const { mutate, isPending } = useVerifyOtp(email);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
  });

  return (
    <form
      onSubmit={handleSubmit((v) => mutate(v.otp))}
      noValidate
      className="space-y-6"
    >
      <div className="space-y-3">
        <p className="text-sm font-medium text-ink">Verification code</p>
        <Controller
          name="otp"
          control={control}
          render={({ field }) => (
            <InputOTP
              maxLength={6}
              value={field.value ?? ""}
              onChange={field.onChange}
              aria-label="6-digit verification code"
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

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-amber hover:bg-amber/90 text-ink font-semibold text-base"
      >
        {isPending ? "Verifying…" : "Verify email"}
      </Button>

      <div className="text-center">
        <ResendOtpButton email={email} />
      </div>
    </form>
  );
}
