"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { offboardTeacher } from "../api/staff-api";

export function useOffboardTeacher(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => offboardTeacher(id, reason),
    onSuccess: () => {
      // The profile is deleted and the caller navigates away. Stale-mark
      // without refetching: an immediate refetch would hit the still-mounted
      // detail query, 404, and flash an error before the redirect lands. The
      // list refetches when it mounts.
      queryClient.invalidateQueries({ queryKey: ["staff"], refetchType: "none" });
      // Their class-teacher and subject assignments were removed too, so
      // anything showing who teaches what is stale. Same two prefixes the
      // class-teacher assign/unassign mutations refresh.
      queryClient.invalidateQueries({ queryKey: ["academic-structure"] });
      queryClient.invalidateQueries({ queryKey: ["onboarding", "review"] });
      toast.success("Teacher offboarded");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
