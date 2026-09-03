"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { applyAuthTokens } from "@/lib/auth/apply-auth-tokens";
import { buildHandoffUrl } from "@/lib/auth/handoff";
import { resolvePostAuthPath } from "@/lib/auth/resolve-post-auth-path";
import { getCurrentSchoolSlug } from "@/lib/tenant/get-current-school-slug";
import { useAuthStore } from "@/stores/auth-store";
import { useSchoolStore } from "@/stores/school-store";

import { createSchool } from "../api/auth-api";
import type { CreateSchoolFormValues } from "../schemas/create-school-schema";

export function useCreateSchool() {
  const router = useRouter();
  const setCurrentSchool = useSchoolStore((s) => s.setCurrentSchool);

  return useMutation({
    mutationFn: (values: CreateSchoolFormValues) => createSchool(values),
    onSuccess: async (data) => {
      if (!data.access || !data.refresh) return;
      applyAuthTokens(data.access, data.refresh);

      // From the response, not the submitted form: `school` is the exact
      // SchoolDetailSerializer login's own getSchoolDetail() reads, so this is
      // the canonical record (school_type/levels as the backend computed them,
      // not re-derived client-side) rather than an echo of what was typed.
      const school = data.school;
      if (school) {
        setCurrentSchool({
          id: school.id,
          name: school.name,
          slug: school.slug,
          school_type: school.school_type,
          levels: school.levels,
        });
      }

      const { path } = await resolvePostAuthPath({ state: data.state });

      // Same hand-off as login (see handleScoped in use-login.ts) and for the
      // identical reason: a brand-new school has no subdomain session yet, so
      // signing up on the apex must carry the fresh tokens across rather than
      // leave the visitor on myschoolos.io/onboarding while their school lives
      // at <slug>.myschoolos.io. Only from the apex — getCurrentSchoolSlug()
      // guards the (unlikely but possible) case of creating a school while
      // already on some other subdomain, where there is nothing to hand off.
      if (school?.slug && getCurrentSchoolSlug() === null) {
        const handoffUrl = buildHandoffUrl(school.slug, data.access, data.refresh, path);
        // Give the session away rather than keeping a copy — the hand-off page
        // rotates on arrival and the backend blacklists the old refresh token,
        // so a copy left on the apex would be a dead pair behind a still-valid-
        // looking access token within a second. clearSession, not clearAuth:
        // nothing has been submitted yet on this brand-new account to lose.
        useAuthStore.getState().clearSession();
        window.location.href = handoffUrl;
        return;
      }

      router.push(path);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
