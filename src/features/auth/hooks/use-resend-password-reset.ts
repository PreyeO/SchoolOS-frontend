"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { requestPasswordReset } from "../api/auth-api";

// Same request endpoint as the initial "forgot password" submit — the
// backend re-issues a fresh OTP each call (no separate resend action).
export function useResendPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
    onSuccess: (data) => {
      toast.success(data.detail);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
