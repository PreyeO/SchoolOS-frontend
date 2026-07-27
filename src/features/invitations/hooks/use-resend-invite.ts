"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { resendInvite } from "../api/invitations-api";
import { PENDING_INVITES_QUERY_KEY } from "./use-pending-invites";

export function useResendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resendInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_INVITES_QUERY_KEY });
      toast.success("Invite resent");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
