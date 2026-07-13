"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { getSchoolId } from "@/lib/school/get-school-id";
import type { StepKey } from "@/lib/school/onboarding-steps";
import { useSchoolStore } from "@/stores/school-store";

import { advanceOnboardingStage, createClasses } from "../api/onboarding-api";
import { handleStageResult } from "../lib/handle-stage-result";
import type { ClassesFormValues } from "../schemas/classes-schema";

export function useCreateClasses(onAdvanced: (currentStep: StepKey) => void) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateClassCount = useSchoolStore((s) => s.updateClassCount);
  const markSetupStep = useSchoolStore((s) => s.markSetupStep);

  return useMutation({
    mutationFn: async (values: ClassesFormValues) => {
      const schoolId = getSchoolId();
      if (!schoolId) throw new Error("Missing school id — please log in again.");

      const result = await createClasses({ classes: values.classes });
      const stage = await advanceOnboardingStage(schoolId, "classes");
      return { result, stage };
    },
    onSuccess: ({ result, stage }) => {
      updateClassCount(result.classes.length);
      markSetupStep("classes");
      queryClient.invalidateQueries({ queryKey: ["onboarding", "review"] });
      handleStageResult(stage, router, onAdvanced);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
