"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { inviteParent } from "../api/invitations-api";
import { formatDetail } from "../lib/format-detail";
import type { InviteParentFormValues } from "../schemas/invite-parent-schema";

export function useInviteParent() {
  return useMutation({
    mutationFn: (values: InviteParentFormValues) => inviteParent(values),
    onSuccess: (data) => {
      toast.success(formatDetail(data.detail));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
