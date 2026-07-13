"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { applyAuthTokens } from "@/lib/auth/apply-auth-tokens";
import { resolvePostAuthPath } from "@/lib/auth/resolve-post-auth-path";
import { useAuthStore } from "@/stores/auth-store";
import { useSchoolStore } from "@/stores/school-store";

import { getCurrentSchool, login, resendOtp } from "../api/auth-api";
import type { LoginPayload, LoginResponse, SchoolSummary } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UseLoginOptions {
  onSelectionNeeded: (schools: SchoolSummary[]) => void;
}

export function useLogin({ onSelectionNeeded }: UseLoginOptions) {
  const router = useRouter();
  const setPendingEmail = useAuthStore((s) => s.setPendingVerificationEmail);
  const setCurrentSchool = useSchoolStore((s) => s.setCurrentSchool);

  async function handleScoped(data: LoginResponse, variables: LoginPayload) {
    if (data.requires_school_selection) return;
    applyAuthTokens(data.access, data.refresh);

    // Hydrate branding so the dashboard/onboarding shell paints correctly.
    // Non-blocking: on failure it falls back to SchoolOS defaults.
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

    const { path, external } = await resolvePostAuthPath({ state: data.state, slug: variables.school_slug });
    if (external) window.location.href = path;
    else router.push(path);
  }

  function handleError(error: unknown, variables: LoginPayload) {
    const message = getErrorMessage(error);
    // ⚠️ TEMPORARY heuristic: string-match "verify". RECOMMEND backend return a
    // machine-readable code (e.g. code: "email_unverified") so we stop matching copy.
    const looksUnverified = /verify/i.test(message);
    if (looksUnverified && EMAIL_RE.test(variables.identifier)) {
      setPendingEmail(variables.identifier);
      resendOtp(variables.identifier).catch(() => undefined);
      toast.error(message);
      router.push(`/verify-otp?email=${encodeURIComponent(variables.identifier)}`);
      return;
    }
    toast.error(message);
  }

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data, variables) => {
      if (data.requires_school_selection) {
        onSelectionNeeded(data.schools);
        return;
      }
      void handleScoped(data, variables);
    },
    onError: handleError,
  });
}
