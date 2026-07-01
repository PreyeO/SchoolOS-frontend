"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSchoolStore } from "@/stores/school-store";
import { getErrorMessage } from "@/lib/api/get-error-message";

import { updateBranding } from "../api/onboarding-api";
import type { BrandingFormValues } from "../schemas/branding-schema";

export function useUpdateBranding() {
  const updateBrandingStore = useSchoolStore((s) => s.updateBranding);
  const markSetupStep = useSchoolStore((s) => s.markSetupStep);

  return useMutation({
    mutationFn: (values: BrandingFormValues) =>
      updateBranding({ primary_color: values.primary_color, logo: values.logo }),
    onSuccess: (data) => {
      updateBrandingStore({ primaryColor: data.primary_color, logoUrl: data.logo_url });
      markSetupStep("branding");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
