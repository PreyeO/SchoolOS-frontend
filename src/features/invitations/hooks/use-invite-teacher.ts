"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { inviteTeacher } from "../api/invitations-api";
import { formatDetail } from "../lib/format-detail";
import type { InviteTeacherFormValues } from "../schemas/invite-teacher-schema";

export function useInviteTeacher() {
  return useMutation({
    mutationFn: (values: InviteTeacherFormValues) => inviteTeacher(values),
    onSuccess: (data) => {
      toast.success(formatDetail(data.detail));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
