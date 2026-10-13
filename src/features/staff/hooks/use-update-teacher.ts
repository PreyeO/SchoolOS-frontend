"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ME_QUERY_KEY } from "@/features/me/hooks/use-me";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";

import { updateTeacher } from "../api/staff-api";
import type { TeacherUpdatePayload } from "../types";

// Used from two places: an admin on /staff/:id, and a teacher on /profile
// editing themselves. Both refresh ["staff"] (lists, detail, the class-teacher
// picker, which filters on teacher_type) and /me (the shell's avatar and
// name, and /profile, read from it).
export function useUpdateTeacher(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TeacherUpdatePayload) => updateTeacher(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// The staff-record half (employee ID, qualification, specialization, type)
// needs edit_staff. Name, phone and photo also need it when it's someone
// else's profile; a teacher's own are covered on /profile.
export function useCanEditStaff(): boolean {
  return useHasSchoolPermission("edit_staff");
}
