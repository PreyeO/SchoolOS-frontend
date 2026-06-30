"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { useAuthStore } from "@/stores/auth-store";

import { signup } from "../api/auth-api";
import type { SignupFormValues } from "../schemas/signup-schema";

export function useSignup() {
  const router = useRouter();
  const setPendingEmail = useAuthStore((s) => s.setPendingVerificationEmail);

  return useMutation({
    mutationFn: (values: SignupFormValues) => signup(values),
    onSuccess: (data, variables) => {
      toast.success(data.detail);
      setPendingEmail(variables.email);
      router.push(
        `/verify-otp?email=${encodeURIComponent(variables.email)}`,
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
