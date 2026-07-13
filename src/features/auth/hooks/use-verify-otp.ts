"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { applyAuthTokens } from "@/lib/auth/apply-auth-tokens";
import { resolvePostAuthPath } from "@/lib/auth/resolve-post-auth-path";
import { useSchoolStore } from "@/stores/school-store";

import { getCurrentSchool, verifyEmail } from "../api/auth-api";
import type { VerifyOtpResponse } from "../types";

export function useVerifyOtp(email: string) {
  const router = useRouter();
  const setCurrentSchool = useSchoolStore((s) => s.setCurrentSchool);

  async function handleSuccess(data: VerifyOtpResponse) {
    toast.success(data.detail);
    applyAuthTokens(data.access, data.refresh);

    if (data.state === "complete") {
      // An invited persona verifying into an existing school — hydrate branding
      // so the shell paints correctly. Non-blocking on failure.
      try {
        const school = await getCurrentSchool();
        setCurrentSchool({
          id: school.id,
          name: school.name,
          slug: school.slug,
          school_type: school.school_type,
          levels: school.levels,
        });
      } catch {
        /* dashboard/onboarding still renders with defaults */
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
