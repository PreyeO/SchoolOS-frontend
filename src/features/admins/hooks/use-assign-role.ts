"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { assignRole } from "../api/admins-api";
import { ADMIN_DETAIL_QUERY_KEY } from "./use-admin-detail";

export function useAssignRole(adminId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => assignRole(adminId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DETAIL_QUERY_KEY(adminId) });
      queryClient.invalidateQueries({ queryKey: ["admins", "list"] });
      toast.success("Role assigned");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
