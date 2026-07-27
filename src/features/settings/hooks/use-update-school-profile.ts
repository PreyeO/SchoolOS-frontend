"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { getSchoolId } from "@/lib/school/get-school-id";
import { useSchoolStore } from "@/stores/school-store";

import { updateSchoolProfile, type SchoolProfilePayload } from "../api/school-profile-api";
import { SCHOOL_PROFILE_QUERY_KEY } from "./use-school-profile";

// Not using the shared useMutationWithToast factory here — that one hardcodes
// invalidating onboarding review + academic-structure, neither of which this
// touches. School profile has its own query key.
export function useUpdateSchoolProfile() {
  const queryClient = useQueryClient();
  const updateBranding = useSchoolStore((s) => s.updateBranding);

  return useMutation({
    mutationFn: (payload: SchoolProfilePayload) => {
      const schoolId = getSchoolId();
      if (!schoolId) throw new Error("Missing school id — please log in again.");
      return updateSchoolProfile(schoolId, payload);
    },
    onSuccess: (school) => {
      updateBranding({
        name: school.name,
        primaryColor: school.primary_color,
        accentColor: school.accent_color,
        logoUrl: school.logo,
        motto: school.motto,
      });
      queryClient.invalidateQueries({ queryKey: SCHOOL_PROFILE_QUERY_KEY });
      toast.success("Saved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
