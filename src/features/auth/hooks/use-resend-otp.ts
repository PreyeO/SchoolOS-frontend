"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { resendOtp } from "../api/auth-api";

export function useResendOtp() {
  return useMutation({
    mutationFn: (email: string) => resendOtp(email),
    onSuccess: (data) => {
      toast.success(data.detail);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
