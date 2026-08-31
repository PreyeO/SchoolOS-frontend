"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { applyAuthTokens } from "@/lib/auth/apply-auth-tokens";
import { resolvePostAuthPath } from "@/lib/auth/resolve-post-auth-path";
import { getSchoolDetail } from "@/lib/school/get-school-detail";
import { useAuthStore } from "@/stores/auth-store";
import { useSchoolStore } from "@/stores/school-store";

import { login, resendOtp } from "../api/auth-api";
import type { LoginPayload, LoginResponse, SchoolSummary } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UseLoginOptions {
  onSelectionNeeded: (schools: SchoolSummary[]) => void;
}

export function useLogin({ onSelectionNeeded }: UseLoginOptions) {
  const router = useRouter();
  const setPendingEmail = useAuthStore((s) => s.setPendingVerificationEmail);
  const hydrateSchool = useSchoolStore((s) => s.hydrateSchool);

  async function handleScoped(data: LoginResponse) {
    if (data.requires_school_selection) return;
    const claims = applyAuthTokens(data.access, data.refresh);

    // Hydrate identity + branding so the dashboard/onboarding shell paints
    // with the school's real colours. Non-blocking: on failure it falls back
    // to whatever's already in the store (or SchoolOS defaults for a fresh one).
    if (claims.school_id) {
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

    // Always same-origin: see resolveNextStep on why the subdomain hand-off
    // was removed. Signing in at the apex keeps you at the apex.
    const { path } = await resolvePostAuthPath({ state: data.state });
    router.push(path);
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
    onSuccess: (data) => {
      if (data.requires_school_selection) {
        onSelectionNeeded(data.schools);
        return;
      }
      void handleScoped(data);
    },
    onError: handleError,
  });
}
