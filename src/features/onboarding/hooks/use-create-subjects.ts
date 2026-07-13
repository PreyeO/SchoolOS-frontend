"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { getSchoolId } from "@/lib/school/get-school-id";
import type { StepKey } from "@/lib/school/onboarding-steps";
import { useSchoolStore } from "@/stores/school-store";

import { advanceOnboardingStage, createSubjects } from "../api/onboarding-api";
import { handleStageResult } from "../lib/handle-stage-result";
import type { CreateSubjectsPayload } from "../types";

export function useCreateSubjects(onAdvanced: (currentStep: StepKey) => void) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateSubjectCount = useSchoolStore((s) => s.updateSubjectCount);
  const markSetupStep = useSchoolStore((s) => s.markSetupStep);

  const save = useMutation({
    mutationFn: async (payload: CreateSubjectsPayload) => {
      const schoolId = getSchoolId();
      if (!schoolId) throw new Error("Missing school id — please log in again.");

      const result = await createSubjects(payload);
      const stage = await advanceOnboardingStage(schoolId, "subjects");
      return { result, stage };
    },
    onSuccess: ({ result, stage }) => {
      updateSubjectCount(result.subjects.length);
      markSetupStep("subjects");
      queryClient.invalidateQueries({ queryKey: ["onboarding", "review"] });
      handleStageResult(stage, router, onAdvanced);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Skippable — no POST, just advances with skipped: true.
  const skip = useMutation({
    mutationFn: async () => {
      const schoolId = getSchoolId();
      if (!schoolId) throw new Error("Missing school id — please log in again.");
      return advanceOnboardingStage(schoolId, "subjects", true);
    },
    onSuccess: (stage) => {
      queryClient.invalidateQueries({ queryKey: ["onboarding", "review"] });
      handleStageResult(stage, router, onAdvanced);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    save: save.mutate,
    isSaving: save.isPending,
    skip: skip.mutate,
    isSkipping: skip.isPending,
  };
}
