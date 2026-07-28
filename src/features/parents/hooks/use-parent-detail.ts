"use client";

import { useQuery } from "@tanstack/react-query";

import { getParentDetail } from "../api/parents-api";

export function useParentDetail(id: string) {
  return useQuery({
    queryKey: ["parents", "detail", id],
    queryFn: () => getParentDetail(id),
  });
}
