"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { getSchoolId } from "@/lib/school/get-school-id";
import type { StepKey } from "@/lib/school/onboarding-steps";
import { useSchoolStore } from "@/stores/school-store";

import { advanceOnboardingStage, createAcademicSession } from "../api/onboarding-api";
import { handleStageResult } from "../lib/handle-stage-result";
import type { AcademicYearFormValues } from "../schemas/academic-year-schema";

export function useCreateSession(onAdvanced: (currentStep: StepKey) => void) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateSession = useSchoolStore((s) => s.updateSession);

  return useMutation({
    mutationFn: async (values: AcademicYearFormValues) => {
      const schoolId = getSchoolId();
      if (!schoolId) throw new Error("Missing school id — please log in again.");

      const session = await createAcademicSession({
        name: values.name,
        periods: values.periods.map((p, i) => ({
          name: p.name,
          order: i + 1,
          start_date: p.start_date,
          end_date: p.end_date,
          is_current: p.is_current,
        })),
      });
      const stage = await advanceOnboardingStage(schoolId, "academic_year");
      return { session, stage };
    },
    onSuccess: ({ session, stage }) => {
      const currentPeriod = session.periods.find((p) => p.is_current);
      updateSession(session.name, currentPeriod?.name ?? null);
      queryClient.invalidateQueries({ queryKey: ["onboarding", "review"] });
      handleStageResult(stage, router, onAdvanced);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
