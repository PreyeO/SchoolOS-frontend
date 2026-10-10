"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { offboardAdmin } from "../api/admins-api";

export function useOffboardAdmin(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => offboardAdmin(id, reason),
    onSuccess: () => {
      // The profile is deleted and the caller navigates away. Stale-mark
      // without refetching, or the still-mounted detail query 404s and flashes
      // an error before the redirect lands. The list refetches on mount.
      queryClient.invalidateQueries({ queryKey: ["admins"], refetchType: "none" });
      toast.success("Admin offboarded");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
