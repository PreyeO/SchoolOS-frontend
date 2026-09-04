"use client";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { env } from "@/config/env";
import { switchSchool } from "@/features/auth/api/auth-api";
import { SCHOOL_ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { applyAuthTokens } from "@/lib/auth/apply-auth-tokens";
import { decodeToken } from "@/lib/auth/decode-token";
import { buildHandoffUrl } from "@/lib/auth/handoff";
import { resolvePostAuthPath } from "@/lib/auth/resolve-post-auth-path";
import { getCurrentSchoolSlug } from "@/lib/tenant/get-current-school-slug";
import type { SchoolDetailResponse } from "@/lib/school/get-school-detail";
import { useSchoolStore } from "@/stores/school-store";

// Bypasses apiClient's request interceptor, which unconditionally attaches
// whatever token is CURRENTLY in the store — still the OLD school's, at the
// point this runs, since the whole reason to call it is finding out whether
// the new tokens can even be applied here. Only used on the cross-subdomain
// path below; asking with the wrong identity would return the wrong school
// (or 403, if the two share no membership).
async function getSchoolDetailAs(schoolId: string, access: string): Promise<SchoolDetailResponse> {
  const { data } = await axios.get<SchoolDetailResponse>(
    `${env.API_BASE_URL}${SCHOOL_ENDPOINTS.DETAIL(schoolId)}`,
    { headers: { Authorization: `Bearer ${access}` } },
  );
  return data;
}

// Switching schools can mean switching subdomains, and didn't: a teacher at
// both bloosom.myschoolos.io and fggc.myschoolos.io, picking FGGC from the
// switcher while on Blossom's own subdomain, got FGGC's tokens written into
// Blossom's origin-scoped localStorage and stayed on bloosom.myschoolos.io —
// the same "same-origin" resolvePostAuthPath every other post-auth flow
// correctly uses (login, verify-otp, create-school, accept-invite), which
// deliberately never crosses origins because tokens don't travel with a plain
// redirect. That's right for those flows — they only ever run on the origin
// the session already belongs to. It's wrong here, since the whole point of
// switching schools is landing somewhere that ISN'T the current membership.
//
// A full page load (not router.push) is still deliberate on both branches
// below, not an oversight — switching schools swaps the entire tenant context
// (permissions, academic structure, everything TanStack Query has cached
// under the old school's data). A soft navigation would leave stale
// cross-school data sitting in the query cache; a hard reload guarantees
// everything refetches clean.
export function useSwitchSchool() {
  const hydrateSchool = useSchoolStore((s) => s.hydrateSchool);

  return useMutation({
    mutationFn: (schoolSlug: string) => switchSchool(schoolSlug),
    onSuccess: async (data) => {
      const claims = decodeToken(data.access);
      const currentSlug = getCurrentSchoolSlug();

      const school = claims.school_id
        ? await getSchoolDetailAs(claims.school_id, data.access).catch(() => null)
        : null;

      // On a school's own subdomain, headed to a different one: carry the new
      // pair across in the URL fragment rather than storing them here first,
      // the same mechanism (and the same reason) the apex→subdomain hand-off
      // after login already uses — see lib/auth/handoff.ts. The new origin's
      // /auth-handoff stores them, rotates the refresh token, and warms the
      // school store itself; nothing here needs to.
      if (currentSlug && school && school.slug !== currentSlug) {
        window.location.href = buildHandoffUrl(school.slug, data.access, data.refresh, "/dashboard");
        return;
      }

      // Already on the right origin — the apex (school scoping there comes
      // from the JWT, not the host), or the target's own subdomain, or the
      // school detail call above failed and there's nothing to compare
      // against. Same as before: apply directly and reload in place.
      applyAuthTokens(data.access, data.refresh);
      if (school) {
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
      }
      // else: the reloaded dashboard still resolves branding via useSyncSchoolData.

      const { path } = await resolvePostAuthPath({ state: data.state });
      window.location.href = path;
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
