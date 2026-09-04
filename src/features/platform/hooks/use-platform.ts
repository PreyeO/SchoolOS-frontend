"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { useAuthStore } from "@/stores/auth-store";

import {
  extendSchoolAccess,
  getPlatformAdmins,
  getPlatformFinancials,
  getPlatformSchool,
  getPlatformSchools,
  getPlatformSchoolsPage,
} from "../api/platform-api";
import type { ExtendAccessPayload } from "../types";

// Its own key prefix. Platform data is cross-school and shares nothing with
// the school-scoped caches — and clearAuth wipes those on logout, which should
// not depend on a platform admin's queries being namespaced under them.
const PLATFORM_KEY = "platform";

export function usePlatformSchools(search?: string) {
  return useQuery({
    queryKey: [PLATFORM_KEY, "schools", search ?? ""],
    queryFn: () => getPlatformSchools(search),
  });
}

export function usePlatformSchoolsPage(page: number, pageSize: number, search?: string) {
  return useQuery({
    queryKey: [PLATFORM_KEY, "schools-page", page, pageSize, search ?? ""],
    queryFn: () =>
      getPlatformSchoolsPage({ page, page_size: pageSize, ...(search ? { search } : {}) }),
    // Keeps the current page on screen while the next one loads.
    placeholderData: (previous) => previous,
  });
}

export function usePlatformSchool(id: string | null) {
  return useQuery({
    queryKey: [PLATFORM_KEY, "school", id],
    queryFn: () => getPlatformSchool(id as string),
    enabled: !!id,
  });
}

export function usePlatformFinancials() {
  return useQuery({
    queryKey: [PLATFORM_KEY, "financials"],
    queryFn: getPlatformFinancials,
  });
}

export function usePlatformAdmins() {
  return useQuery({
    queryKey: [PLATFORM_KEY, "admins"],
    queryFn: getPlatformAdmins,
  });
}

// The signed-in platform admin's own record.
//
// /auth/me/ 403s for a platform admin — it requires school context — so there
// is no self endpoint. The staff list is the only place their name, role and
// permissions exist, so identity is resolved by matching the JWT's user_id
// against it. Cheap: the same cached list the Staff screen renders.
export function useCurrentPlatformAdmin() {
  const userId = useAuthStore((s) => s.claims?.user_id);
  const { data, isPending } = usePlatformAdmins();

  return {
    admin: data?.find((a) => a.user.id === userId),
    isPending,
  };
}

export function useExtendAccess(schoolId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExtendAccessPayload) => extendSchoolAccess(schoolId, payload),
    onSuccess: () => {
      // access_status appears on the school detail, the schools list AND every
      // financials row, so all three are stale at once.
      queryClient.invalidateQueries({ queryKey: [PLATFORM_KEY] });
      toast.success("Access updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
