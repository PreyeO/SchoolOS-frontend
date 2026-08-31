"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { applyAuthTokens } from "@/lib/auth/apply-auth-tokens";
import { resolvePostAuthPath } from "@/lib/auth/resolve-post-auth-path";
import { deriveSchoolType, sortLevels } from "@/lib/school/derive-school-type";
import { useSchoolStore } from "@/stores/school-store";

import { createSchool } from "../api/auth-api";
import type { CreateSchoolFormValues } from "../schemas/create-school-schema";
import type { SchoolLevelValue } from "@/data/school-levels";

export function useCreateSchool() {
  const router = useRouter();
  const setCurrentSchool = useSchoolStore((s) => s.setCurrentSchool);

  return useMutation({
    mutationFn: (values: CreateSchoolFormValues) => createSchool(values),
    onSuccess: async (data, variables) => {
      let schoolId = "";
      if (data.access && data.refresh) {
        const claims = applyAuthTokens(data.access, data.refresh);
        schoolId = claims.school_id ?? "";
      }

      const levels = sortLevels(variables.levels as SchoolLevelValue[]);
      setCurrentSchool({
        id: schoolId,
        name: variables.name,
        slug: variables.slug,
        school_type: deriveSchoolType(levels),
        levels,
      });

      const { path } = await resolvePostAuthPath({ state: data.state });
      router.push(path);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
