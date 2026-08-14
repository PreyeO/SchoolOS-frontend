"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { inviteTeacher } from "../api/invitations-api";
import { formatDetail } from "../lib/format-detail";
import { PENDING_INVITES_QUERY_KEY } from "./use-pending-invites";
import type { InviteTeacherFormValues } from "../schemas/invite-teacher-schema";

export function useInviteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: InviteTeacherFormValues) => inviteTeacher(values),
    onSuccess: (data) => {
      // Pending invites sits on the same page as this form, so a new invite that
      // doesn't appear until a manual refresh looks like it wasn't sent. The
      // invite also creates the membership and teacher profile straight away, so
      // the staff directory is stale too.
      queryClient.invalidateQueries({ queryKey: PENDING_INVITES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success(formatDetail(data.detail));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
