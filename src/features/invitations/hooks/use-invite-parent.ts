"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { inviteParent, type InviteParentInput } from "../api/invitations-api";
import { formatDetail } from "../lib/format-detail";
import { PENDING_INVITES_QUERY_KEY } from "./use-pending-invites";

export function useInviteParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: InviteParentInput) => inviteParent(values),
    onSuccess: (data) => {
      // See use-invite-teacher: the pending list is on this same page, and the
      // invite creates the membership and parent profile immediately.
      queryClient.invalidateQueries({ queryKey: PENDING_INVITES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      toast.success(formatDetail(data.detail));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
