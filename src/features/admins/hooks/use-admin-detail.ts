"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminDetail } from "../api/admins-api";

export const ADMIN_DETAIL_QUERY_KEY = (id: string) => ["admins", "detail", id];

export function useAdminDetail(id: string) {
  return useQuery({
    queryKey: ADMIN_DETAIL_QUERY_KEY(id),
    queryFn: () => getAdminDetail(id),
  });
}
