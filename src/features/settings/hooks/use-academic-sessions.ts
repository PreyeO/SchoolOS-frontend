"use client";

import { useQuery } from "@tanstack/react-query";

import { getSchoolId } from "@/lib/school/get-school-id";

import { getAcademicSessions } from "../api/sessions-api";

// Keyed under the shared "academic-structure" prefix so useMutationWithToast's
// broad invalidation (add/edit/delete session or period) refreshes this list.
export const ACADEMIC_SESSIONS_QUERY_KEY = ["academic-structure", "sessions"];

export function useAcademicSessions() {
  const schoolId = getSchoolId();

  return useQuery({
    queryKey: ACADEMIC_SESSIONS_QUERY_KEY,
    queryFn: getAcademicSessions,
    enabled: !!schoolId,
  });
}
