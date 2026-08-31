"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { applyAuthTokens } from "@/lib/auth/apply-auth-tokens";
import { resolvePostAuthPath } from "@/lib/auth/resolve-post-auth-path";
import { getSchoolDetail } from "@/lib/school/get-school-detail";
import { useSchoolStore } from "@/stores/school-store";

import { acceptInvite } from "../api/invitations-api";
import type { AcceptInvitePayload } from "../types";

// Mirrors useLogin's handleScoped exactly — accept-invite's response is the
// same LoginScopedResponse shape (both built from the backend's
// _token_pair_dict), so the post-accept flow (store tokens, hydrate the
// school's branding, resolve where to land) is identical to a normal login.
export function useAcceptInvite() {
  const router = useRouter();
  const hydrateSchool = useSchoolStore((s) => s.hydrateSchool);

  return useMutation({
    mutationFn: (payload: AcceptInvitePayload) => acceptInvite(payload),
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
          /* dashboard still renders with whatever's already in the store */
        }
      }

      const { path } = await resolvePostAuthPath({ state: data.state });
      router.push(path);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
