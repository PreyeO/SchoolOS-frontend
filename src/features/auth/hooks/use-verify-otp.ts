"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { resolveNextStep } from "@/lib/auth/resolve-next-step";
import { useAuthStore } from "@/stores/auth-store";

import { verifyEmail } from "../api/auth-api";

export function useVerifyOtp(email: string) {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: (otp: string) => verifyEmail({ email, otp }),
    onSuccess: (data) => {
      toast.success(data.detail);
      setTokens({ access: data.access, refresh: data.refresh });
      const { path, external } = resolveNextStep({ state: data.state });
      if (external) {
        window.location.href = path;
      } else {
        router.push(path);
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
