"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { applyAuthTokens } from "@/lib/auth/apply-auth-tokens";
import { resolvePostAuthPath } from "@/lib/auth/resolve-post-auth-path";
import { getSchoolDetail } from "@/lib/school/get-school-detail";
import { useSchoolStore } from "@/stores/school-store";

import { verifyEmail } from "../api/auth-api";
import type { VerifyOtpResponse } from "../types";

export function useVerifyOtp(email: string) {
  const router = useRouter();
  const hydrateSchool = useSchoolStore((s) => s.hydrateSchool);

  async function handleSuccess(data: VerifyOtpResponse) {
    toast.success(data.detail);
    const claims = applyAuthTokens(data.access, data.refresh);

    if (data.state === "complete" && claims.school_id) {
      // An invited persona verifying into an existing school — hydrate
      // identity + branding so the shell paints correctly. Non-blocking on
      // failure: falls back to whatever's already in the store.
      try {
        const school = await getSchoolDetail(claims.school_id);
        hydrateSchool({
          id: school.id,
          name: school.name,
          slug: school.slug,
          school_type: school.school_type,
          levels: school.levels,
          primaryColor: school.primary_color,
          accentColor: school.accent_color,
          logoUrl: school.logo,
          motto: school.motto,
        });
      } catch {
        /* dashboard/onboarding still renders with whatever's already in the store */
      }
    }

    const { path, external } = await resolvePostAuthPath({ state: data.state });
    if (external) window.location.href = path;
    else router.push(path);
  }

  return useMutation({
    mutationFn: (otp: string) => verifyEmail({ email, otp }),
    onSuccess: (data) => {
      void handleSuccess(data);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
