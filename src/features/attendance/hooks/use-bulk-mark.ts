"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { bulkMarkAttendance } from "../api/attendance-api";
import type { BulkMarkPayload } from "../types";

export function useBulkMark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkMarkPayload) => bulkMarkAttendance(payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", "records"] });

      // A 200 with a non-empty `skipped` is a partial success, not a failure:
      // those students already had a newer mark (another device, or this
      // register submitted twice), so the server kept the newer one. Saying
      // "saved" flatly would misreport what happened.
      if (result.skipped.length > 0) {
        toast.warning(
          `Saved ${result.applied.length}. ${result.skipped.length} skipped — a newer mark already exists for them.`,
        );
        return;
      }
      toast.success(`Register saved for ${result.applied.length} student${result.applied.length === 1 ? "" : "s"}.`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
