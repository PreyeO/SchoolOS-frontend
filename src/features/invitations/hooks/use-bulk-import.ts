"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage, isTimeoutError } from "@/lib/api/get-error-message";

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
    // A timeout here is not a failure we can assert. The write is one
    // transaction server-side, so it either committed or it didn't — but we
    // stopped listening and can't tell which. "Check the student list" is the
    // only honest instruction; "try again" would be wrong if it succeeded, and
    // a plain network error would be wrong either way.
    //
    // The list is still invalidated, so if it did land, the directory is
    // already correct when they go and look.
    onError: (error) => {
      if (isTimeoutError(error)) {
        queryClient.invalidateQueries({ queryKey: ["students"] });
        toast.error(
          "The import is taking longer than expected. It may still have completed — check your student list before importing this file again.",
          { duration: 12000 },
        );
        return;
      }
      toast.error(getErrorMessage(error));
    },
  });
}
