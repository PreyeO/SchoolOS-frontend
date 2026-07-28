"use client";

import { useQuery } from "@tanstack/react-query";

import { getParents } from "../api/parents-api";
import type { ParentFilters } from "../types";

export function useParents(filters: ParentFilters) {
  return useQuery({
    queryKey: ["parents", "list", filters],
    queryFn: () => getParents(filters),
  });
}
