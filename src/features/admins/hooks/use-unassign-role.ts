"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { unassignRole } from "../api/admins-api";
import { ADMIN_DETAIL_QUERY_KEY } from "./use-admin-detail";

export function useUnassignRole(adminId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unassignRole(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DETAIL_QUERY_KEY(adminId) });
      queryClient.invalidateQueries({ queryKey: ["admins", "list"] });
      toast.success("Role removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
