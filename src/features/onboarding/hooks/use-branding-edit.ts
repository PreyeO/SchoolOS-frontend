"use client";

import { useMutationWithToast } from "@/lib/api/use-mutation-with-toast";
import { getSchoolId } from "@/lib/school/get-school-id";
import { useSchoolStore } from "@/stores/school-store";

import { updateBranding } from "../api/onboarding-api";
import type { BrandingFormValues } from "../schemas/branding-schema";

// Same PATCH /schools/:id/ as the onboarding branding step, but scoped to just
// the branding fields (never the create-school profile fields) and with no
// stage-advance — Review edits never advance the wizard.
export function useEditBranding() {
  const updateBrandingStore = useSchoolStore((s) => s.updateBranding);

  return useMutationWithToast(
    (values: BrandingFormValues) => {
      const schoolId = getSchoolId();
      if (!schoolId) throw new Error("Missing school id — please log in again.");
      return updateBranding(schoolId, {
        primary_color: values.primary_color,
        accent_color: values.accent_color,
        // Three states, not two: undefined means "untouched, don't send",
        // null means "the logo was removed, clear it", and a string is a new
        // S3 key. The old `logo?.trim() ? … : {}` collapsed the first two, so
        // removing a logo silently did nothing.
        ...(values.logo_key !== undefined ? { logo_key: values.logo_key } : {}),
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
