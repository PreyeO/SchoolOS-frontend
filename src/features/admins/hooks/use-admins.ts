"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdmins } from "../api/admins-api";
import type { AdminFilters } from "../types";

export function useAdmins(filters: AdminFilters) {
  return useQuery({
    queryKey: ["admins", "list", filters],
    queryFn: () => getAdmins(filters),
  });
}
