"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSchoolStore } from "@/stores/school-store";
import { getErrorMessage } from "@/lib/api/get-error-message";

import { createSubjects } from "../api/onboarding-api";
import type { SubjectsFormValues } from "../schemas/subjects-schema";

export function useCreateSubjects() {
  const updateSubjectCount = useSchoolStore((s) => s.updateSubjectCount);
  const markSetupStep = useSchoolStore((s) => s.markSetupStep);

  return useMutation({
    mutationFn: (values: SubjectsFormValues) =>
      createSubjects({ subjects: values.subjects }),
    onSuccess: (data) => {
      updateSubjectCount(data.count);
      markSetupStep("subjects");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
