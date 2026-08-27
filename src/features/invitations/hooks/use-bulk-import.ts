"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { bulkImportStudents, previewBulkImportStudents } from "../api/invitations-api";

// Writes nothing server-side (commit=False), so there is nothing to
// invalidate or toast on success — the caller renders the returned
// applied/skipped rows directly.
export function usePreviewBulkImport() {
  return useMutation({
    mutationFn: previewBulkImportStudents,
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCommitBulkImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkImportStudents,
    onSuccess: (data) => {
      // Same invalidation as single-student add: the directory and the new
      // enrollments' arm rosters both change.
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success(
        `${data.applied.length} student${data.applied.length === 1 ? "" : "s"} imported`,
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
