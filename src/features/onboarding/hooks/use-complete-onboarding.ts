"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { getSchoolId } from "@/lib/school/get-school-id";

import { advanceOnboardingStage } from "../api/onboarding-api";

// Advancing "review" is what marks onboarding complete (⚠️ confirm with backend).
export function useCompleteOnboarding() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const schoolId = getSchoolId();
      if (!schoolId) throw new Error("Missing school id — please log in again.");
      return advanceOnboardingStage(schoolId, "review");
    },
    onSuccess: (stage) => {
      if (stage.is_completed) {
        toast.success("School setup complete! Welcome to SchoolOS.");
        router.push("/dashboard");
      } else {
        // Backend didn't mark complete — stay in the wizard at whatever step it reports.
        toast.error("Setup isn't quite finished yet — please check the earlier steps.");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
