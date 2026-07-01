"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSchoolStore } from "@/stores/school-store";
import { getErrorMessage } from "@/lib/api/get-error-message";

import { createSession } from "../api/onboarding-api";
import type { AcademicYearFormValues } from "../schemas/academic-year-schema";

export function useCreateSession() {
  const updateSession = useSchoolStore((s) => s.updateSession);
  const markSetupStep = useSchoolStore((s) => s.markSetupStep);

  return useMutation({
    mutationFn: (values: AcademicYearFormValues) =>
      createSession({
        name: values.name,
        is_current: values.is_current,
        terms: values.terms,
      }),
    onSuccess: (data) => {
      updateSession(data.name);
      markSetupStep("academic_year");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
