"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/auth-store";

import type { MeResponse } from "../types";

export const ME_QUERY_KEY = ["me"];

// The caller's own school context. Every non-admin screen leans on this: it's
// the only endpoint that tells a teacher which arms they lead, a parent who
// their children are, or a student what class they're in — the directories that
// hold the same data are gated on admin permissions.
export function useMe() {
  const schoolId = useAuthStore((s) => s.claims?.school_id);

  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: async (): Promise<MeResponse> => {
      const { data } = await apiClient.get<MeResponse>(ENDPOINTS.ME);
      return data;
    },
    // Needs school context — an owner who hasn't created a school yet is
    // refused, so don't fire the request for them at all.
    enabled: !!schoolId,
  });
}
