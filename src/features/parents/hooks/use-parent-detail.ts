"use client";

import { useQuery } from "@tanstack/react-query";

import { getParentDetail } from "../api/parents-api";

export const PARENT_DETAIL_QUERY_KEY = (id: string) => ["parents", "detail", id];

export function useParentDetail(id: string) {
  return useQuery({
    queryKey: PARENT_DETAIL_QUERY_KEY(id),
    queryFn: () => getParentDetail(id),
  });
}
