"use client";

import { useQuery } from "@tanstack/react-query";

import { getPermissionsCatalog } from "../api/roles-api";

// The permission-string catalog is effectively static — no reason to refetch
// it after the initial load.
export function usePermissionsCatalog() {
  return useQuery({
    queryKey: ["settings", "permissions-catalog"],
    queryFn: getPermissionsCatalog,
    staleTime: Infinity,
  });
}
