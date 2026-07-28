"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { requestPasswordReset } from "../api/auth-api";

export function useForgotPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
    onSuccess: (data, email) => {
      toast.success(data.detail);
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
