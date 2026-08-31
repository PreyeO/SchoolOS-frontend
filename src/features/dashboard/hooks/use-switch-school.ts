"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { switchSchool } from "@/features/auth/api/auth-api";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { applyAuthTokens } from "@/lib/auth/apply-auth-tokens";
import { resolvePostAuthPath } from "@/lib/auth/resolve-post-auth-path";
import { getSchoolDetail } from "@/lib/school/get-school-detail";
import { useSchoolStore } from "@/stores/school-store";

// A full page load (not router.push) is deliberate here, not an oversight —
// switching schools swaps the entire tenant context (permissions, academic
// structure, everything TanStack Query has cached under the old school's
// data). A soft navigation would leave stale cross-school data sitting in
// the query cache; a hard reload guarantees everything refetches clean.
export function useSwitchSchool() {
  const hydrateSchool = useSchoolStore((s) => s.hydrateSchool);

  return useMutation({
    mutationFn: (schoolSlug: string) => switchSchool(schoolSlug),
    onSuccess: async (data) => {
      const claims = applyAuthTokens(data.access, data.refresh);

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
          /* the reloaded dashboard still resolves branding via useSyncSchoolData */
        }
      }

      // Same-origin by design now (see resolveNextStep). window.location.href
      // rather than router.push is still deliberate: switching school has to
      // repaint the whole shell, and a hard reload is the simplest way to be
      // sure nothing from the previous school survives in memory.
      const { path } = await resolvePostAuthPath({ state: data.state });
      window.location.href = path;
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
