"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { bulkUpdateStudentStatus, deleteStudent, updateStudentName } from "../api/students-api";
import { enrollmentStatusLabel } from "../lib/labels";
import type { BulkStatusUpdatePayload } from "../types";

// Status, name and delete all change what the directory, detail page, roster
// and promotion screens show, so each one invalidates the whole ["students"]
// tree rather than guessing which keys are affected.

export function useBulkUpdateStudentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkStatusUpdatePayload) => bulkUpdateStudentStatus(payload),
    onSuccess: (result, payload) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      const n = result.applied.length;
      const who = n === 1 ? "1 student" : `${n} students`;
      toast.success(`${who} marked ${enrollmentStatusLabel(payload.status).toLowerCase()}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateStudentName(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { first_name: string; last_name: string }) => updateStudentName(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Name corrected");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// The caller navigates away on success — the record no longer exists. The
// "has records attached" 400 is surfaced as-is: its wording already tells the
// admin to use a status instead.
//
// Stale-marked without refetching: an immediate refetch would hit the
// still-mounted detail query, 404, and flash an error before the redirect.
export function useDeleteStudent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"], refetchType: "none" });
      toast.success("Student deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
