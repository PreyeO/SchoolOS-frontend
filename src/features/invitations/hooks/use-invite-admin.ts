"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { inviteAdmin } from "../api/invitations-api";
import { formatDetail } from "../lib/format-detail";
import type { InviteAdminFormValues } from "../schemas/invite-admin-schema";

export function useInviteAdmin() {
  return useMutation({
    mutationFn: (values: InviteAdminFormValues) => inviteAdmin(values),
    onSuccess: (data) => {
      toast.success(formatDetail(data.detail));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
