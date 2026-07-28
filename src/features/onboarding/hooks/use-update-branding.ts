"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { getSchoolId } from "@/lib/school/get-school-id";
import type { StepKey } from "@/lib/school/onboarding-steps";
import { useSchoolStore } from "@/stores/school-store";

import { advanceOnboardingStage, updateBranding } from "../api/onboarding-api";
import { handleStageResult } from "../lib/handle-stage-result";
import type { BrandingFormValues } from "../schemas/branding-schema";

export function useUpdateBranding(onAdvanced: (currentStep: StepKey) => void) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateBrandingStore = useSchoolStore((s) => s.updateBranding);

  const save = useMutation({
    mutationFn: async (values: BrandingFormValues) => {
      const schoolId = getSchoolId();
      if (!schoolId) throw new Error("Missing school id — please log in again.");

      const school = await updateBranding(schoolId, {
        primary_color: values.primary_color,
        accent_color: values.accent_color,
        ...(values.logo?.trim() ? { logo: values.logo.trim() } : {}),
        ...(values.motto?.trim() ? { motto: values.motto.trim() } : {}),
      });
      const stage = await advanceOnboardingStage(schoolId, "branding");
      return { school, stage };
    },
    onSuccess: ({ school, stage }) => {
      updateBrandingStore({
        primaryColor: school.primary_color,
        accentColor: school.accent_color,
        logoUrl: school.logo,
        motto: school.motto,
      });
      queryClient.invalidateQueries({ queryKey: ["onboarding", "review"] });
      handleStageResult(stage, router, onAdvanced);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Skippable — no PATCH, just advances with skipped: true.
  const skip = useMutation({
    mutationFn: async () => {
      const schoolId = getSchoolId();
      if (!schoolId) throw new Error("Missing school id — please log in again.");
      return advanceOnboardingStage(schoolId, "branding", true);
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
