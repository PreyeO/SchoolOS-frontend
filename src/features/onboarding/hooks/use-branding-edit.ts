"use client";

import { getSchoolId } from "@/lib/school/get-school-id";
import { useSchoolStore } from "@/stores/school-store";

import { updateBranding } from "../api/onboarding-api";
import { useReviewMutation } from "./use-review-mutation";
import type { BrandingFormValues } from "../schemas/branding-schema";

// Same PATCH /schools/:id/ as the onboarding branding step, but scoped to just
// the branding fields (never the create-school profile fields) and with no
// stage-advance — Review edits never advance the wizard.
export function useEditBranding() {
  const updateBrandingStore = useSchoolStore((s) => s.updateBranding);

  return useReviewMutation(
    (values: BrandingFormValues) => {
      const schoolId = getSchoolId();
      if (!schoolId) throw new Error("Missing school id — please log in again.");
      return updateBranding(schoolId, {
        primary_color: values.primary_color,
        accent_color: values.accent_color,
        ...(values.logo?.trim() ? { logo: values.logo.trim() } : {}),
        ...(values.motto?.trim() ? { motto: values.motto.trim() } : {}),
      });
    },
    "Saved",
    (school) =>
      updateBrandingStore({
        primaryColor: school.primary_color,
        accentColor: school.accent_color,
        logoUrl: school.logo,
        motto: school.motto,
      }),
  );
}
