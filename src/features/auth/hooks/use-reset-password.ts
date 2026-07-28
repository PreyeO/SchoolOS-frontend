"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { confirmPasswordReset } from "../api/auth-api";
import type { ResetPasswordFormValues } from "../schemas/reset-password-schema";

export function useResetPassword(email: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      confirmPasswordReset({
        email,
        otp: values.otp,
        password: values.password,
        confirm_password: values.confirm_password,
      }),
    onSuccess: (data) => {
      toast.success(data.detail);
      router.push("/login");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
