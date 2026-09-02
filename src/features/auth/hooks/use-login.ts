"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { applyAuthTokens } from "@/lib/auth/apply-auth-tokens";
import { resolvePostAuthPath } from "@/lib/auth/resolve-post-auth-path";
import { buildHandoffUrl } from "@/lib/auth/handoff";
import { getCurrentSchoolSlug } from "@/lib/tenant/get-current-school-slug";
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
  // True from the moment a scoped session is about to be applied until the page
  // is gone. LoginView reads it to stand down its already-signed-in guard —
  // see the note below. Never reset: every path out of handleScoped navigates.
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleScoped(data: LoginResponse) {
    if (data.requires_school_selection) return;

    // Set BEFORE applyAuthTokens, and that ordering is the whole fix.
    //
    // applyAuthTokens writes to the auth store SYNCHRONOUSLY, but the redirect
    // below is two awaits away — getSchoolDetail, then getOnboardingStage
    // inside resolvePostAuthPath for an owner. LoginView's "already signed in"
    // guard watches `tokens`, so without this it fired the instant the tokens
    // landed and router.replace'd to /dashboard ON THE APEX, mounting the whole
    // dashboard shell (and its /me, profile and sessions queries) for the few
    // hundred milliseconds before window.location.href threw it all away.
    //
    // That was the reported flicker: myschoolos.io/dashboard → subdomain
    // /auth-handoff → subdomain /dashboard. The guard is for someone who
    // arrives at /login already signed in; a session that appears while the
    // form is on screen is this hook's own, and this hook owns where it goes.
    setIsRedirecting(true);

    const claims = applyAuthTokens(data.access, data.refresh);
    let slug: string | null = null;

    // Hydrate identity + branding so the dashboard/onboarding shell paints
    // with the school's real colours. Non-blocking: on failure it falls back
    // to whatever's already in the store (or SchoolOS defaults for a fresh one).
    if (claims.school_id) {
      try {
        const school = await getSchoolDetail(claims.school_id);
        slug = school.slug;
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

    const { path } = await resolvePostAuthPath({ state: data.state });

    // Signing in on the apex: hand the session to the school's own subdomain so
    // the URL shows which school you're in. Tokens are portable (the backend
    // validates a signature, not an origin); localStorage is not, so they
    // travel in the URL fragment — never sent to a server — and the landing
    // page strips them from history and rotates immediately. See lib/auth/handoff.
    //
    // Only from the apex, and only when the school is known. Already on a
    // subdomain means there is nothing to move.
    if (slug && getCurrentSchoolSlug() === null) {
      const handoffUrl = buildHandoffUrl(slug, data.access, data.refresh, path);

      // Give the session away rather than keeping a copy. The tokens above had
      // to be stored so getSchoolDetail and the onboarding-stage check could
      // authenticate, but the apex must not keep them: the hand-off page
      // rotates on arrival and the backend BLACKLISTS the old refresh token,
      // so within a second this origin is holding a dead pair behind an access
      // token that still looks valid for up to an hour.
      //
      // Left in place, returning to the apex later hits LoginView's
      // already-signed-in guard, lands on the apex dashboard, works for a
      // while, then dies at the first refresh as "Your session expired".
      //
      // clearSession, not clearAuth: this session is being handed on, not
      // ended, so a teacher's queued registers and score drafts on this origin
      // are not ours to delete.
      useAuthStore.getState().clearSession();
      window.location.href = handoffUrl;
      return;
    }

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

  const mutation = useMutation({
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

  // Named fields rather than spreading the mutation object: LoginView uses
  // exactly these three, and spreading a TanStack result touches every property
  // on it, which defeats its change tracking for no benefit.
  //
  // isRedirecting is NOT isPending. isPending goes false the moment onSuccess
  // returns, while handleScoped is still awaiting its two requests — precisely
  // the window this flag exists to cover.
  return { mutate: mutation.mutate, isPending: mutation.isPending, isRedirecting };
}
