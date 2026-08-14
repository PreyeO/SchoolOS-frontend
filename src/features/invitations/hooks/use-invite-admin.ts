"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { inviteAdmin } from "../api/invitations-api";
import { formatDetail } from "../lib/format-detail";
import { PENDING_INVITES_QUERY_KEY } from "./use-pending-invites";
import type { InviteAdminFormValues } from "../schemas/invite-admin-schema";

export function useInviteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: InviteAdminFormValues) => inviteAdmin(values),
    onSuccess: (data) => {
      // See use-invite-teacher: the pending list is on this same page, and the
      // invite creates the membership and admin profile immediately.
      queryClient.invalidateQueries({ queryKey: PENDING_INVITES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success(formatDetail(data.detail));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
