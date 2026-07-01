"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { completeOnboarding } from "../api/onboarding-api";

export function useCompleteOnboarding() {
  const router = useRouter();

  return useMutation({
    mutationFn: () => completeOnboarding(),
    onSuccess: () => {
      toast.success("School setup complete! Welcome to SchoolOS.");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
