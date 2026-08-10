"use client";

import { useQuery } from "@tanstack/react-query";

import { getAttendance, getRoster } from "../api/attendance-api";

export function useRoster(classArmId: string | null) {
  return useQuery({
    queryKey: ["attendance", "roster", classArmId],
    queryFn: () => getRoster(classArmId as string),
    enabled: !!classArmId,
  });
}

export function useAttendance(classArmId: string | null, date: string) {
  return useQuery({
    queryKey: ["attendance", "records", classArmId, date],
    queryFn: () => getAttendance(classArmId as string, date),
    enabled: !!classArmId && !!date,
  });
}
