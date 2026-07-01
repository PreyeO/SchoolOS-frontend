"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSchoolStore } from "@/stores/school-store";
import { getErrorMessage } from "@/lib/api/get-error-message";

import { createClasses } from "../api/onboarding-api";
import type { ClassesFormValues } from "../schemas/classes-schema";

export function useCreateClasses() {
  const updateClassCount = useSchoolStore((s) => s.updateClassCount);
  const markSetupStep = useSchoolStore((s) => s.markSetupStep);

  return useMutation({
    mutationFn: (values: ClassesFormValues) =>
      createClasses({ classes: values.classes }),
    onSuccess: (data) => {
      updateClassCount(data.count);
      markSetupStep("classes");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
