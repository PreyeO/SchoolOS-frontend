"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { bulkClearAttendance } from "../api/attendance-api";
import type { AttendanceRecord, BulkClearPayload, BulkClearResponse } from "../types";
import { attendanceRecordsKey } from "./use-register";

// Clears a register (or part of one), online only.
//
// Deliberately NOT on the offline queue the way bulk-mark is: clearing is a
// rare, deliberate correction, and the page disables it while offline or while
// this register still has marks waiting to sync. The backend's tombstones make
// a queued clear safe in principle, but queue ordering would be one more
// offline path to get right, for an action nobody needs to do on the move.
//
// `onCleared` runs after the cached register has been updated, so the caller
// can reset its device draft without the old marks seeding straight back in.
export function useClearRegister(classArmId: string | null, date: string, onCleared: () => void) {
  const queryClient = useQueryClient();

  return useMutation<BulkClearResponse, Error, BulkClearPayload>({
    mutationFn: bulkClearAttendance,
    // A clear that fails offline should say so now, not wait as a paused
    // mutation that runs later — after the teacher has moved on.
    networkMode: "always",
    onSuccess: (result) => {
      const cleared = new Set(result.cleared);
      // Server truth, applied immediately: the cleared marks are gone. Students
      // the server skipped (a newer mark exists) keep theirs.
      queryClient.setQueryData<AttendanceRecord[]>(attendanceRecordsKey(classArmId, date), (records) =>
        records?.filter((r) => !cleared.has(r.student.id)),
      );
      onCleared();
      // The dashboard's arm-history tiles and daily summaries counted them too.
      queryClient.invalidateQueries({ queryKey: ["attendance"] });

      const removed = result.cleared.length;
      if (result.skipped.length > 0) {
        // The server's own reasons ("a newer mark exists", "marked in a
        // different class arm"), de-duplicated, rather than a guess at them.
        const reasons = Array.from(new Set(result.skipped.map((s) => s.reason))).join("; ");
        toast.warning(`Unmarked ${removed}. ${result.skipped.length} kept: ${reasons}.`);
        return;
      }
      toast.success(`Register unmarked for ${removed} student${removed === 1 ? "" : "s"}.`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// Everyone a whole-register clear has to name. The roster alone would miss a
// student who has moved arm since but still has a mark on this register; their
// saved record alone would miss a mark still in flight from another device,
// which the server's tombstone blocks only for the students we send.
export function clearRegisterStudentIds(
  rosterIds: string[],
  savedRecords: AttendanceRecord[] | undefined,
): string[] {
  return Array.from(new Set([...rosterIds, ...(savedRecords ?? []).map((r) => r.student.id)]));
}
