"use client";

import { useQuery } from "@tanstack/react-query";

import { getTeacherDetail } from "../api/staff-api";

export function useTeacherDetail(id: string) {
  return useQuery({
    queryKey: ["staff", "teachers", id],
    queryFn: () => getTeacherDetail(id),
  });
}
