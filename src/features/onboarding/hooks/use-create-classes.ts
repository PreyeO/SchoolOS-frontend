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
import { prepareClassesPayload } from "../lib/prepare-classes-payload";
import type { ClassesFormValues } from "../schemas/classes-schema";

export function useCreateClasses(onAdvanced: (currentStep: StepKey) => void) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setClasses = useSchoolStore((s) => s.setClasses);
  const markSetupStep = useSchoolStore((s) => s.markSetupStep);

  return useMutation({
    mutationFn: async (values: ClassesFormValues) => {
      const schoolId = getSchoolId();
      if (!schoolId) throw new Error("Missing school id — please log in again.");

      // Bare array of created classes (id, name, level, order, arms) — kept
      // in full rather than collapsed to a count, so later steps/screens can
      // reference the real records. Blank arm rows are trimmed and a
      // class with none left omits `arms` entirely, per the backend contract.
      const createdClasses = await createClasses(prepareClassesPayload(values));
      const stage = await advanceOnboardingStage(schoolId, "classes");
      return { createdClasses, stage };
    },
    onSuccess: ({ createdClasses, stage }) => {
      setClasses(createdClasses);
      markSetupStep("classes");
      queryClient.invalidateQueries({ queryKey: ["onboarding", "review"] });
      handleStageResult(stage, router, onAdvanced);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
