"use client";

import { useQuery } from "@tanstack/react-query";

import { getParentDetail } from "../api/parents-api";

export const PARENT_DETAIL_QUERY_KEY = (id: string) => ["parents", "detail", id];

// `former` asks for an offboarded parent, who 404s on the default request.
// It's part of the key so the two lookups never share a cache entry.
export function useParentDetail(id: string, former = false) {
  return useQuery({
    queryKey: [...PARENT_DETAIL_QUERY_KEY(id), { former }],
    queryFn: () => getParentDetail(id, former),
  });
}
