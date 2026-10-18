"use client";

import { useQuery } from "@tanstack/react-query";

import { getAttendance, getRoster } from "../api/attendance-api";

// academicPeriodId: see getRoster's own comment. Left out of the query key
// when absent, rather than always appended as undefined, so attendance's own
// call — which never passes it — keeps the exact cache key it always had.
export function useRoster(classArmId: string | null, academicPeriodId?: string | null) {
  return useQuery({
    queryKey: academicPeriodId
      ? ["attendance", "roster", classArmId, academicPeriodId]
      : ["attendance", "roster", classArmId],
    queryFn: () => getRoster(classArmId as string, academicPeriodId ?? undefined),
    enabled: !!classArmId,
  });
}

// Exported so a write (see useClearRegister) can update this exact entry.
export const attendanceRecordsKey = (classArmId: string | null, date: string) =>
  ["attendance", "records", classArmId, date] as const;

export function useAttendance(classArmId: string | null, date: string) {
  return useQuery({
    queryKey: attendanceRecordsKey(classArmId, date),
    queryFn: () => getAttendance(classArmId as string, date),
    enabled: !!classArmId && !!date,
  });
}
