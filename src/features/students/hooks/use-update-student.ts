"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { useIsTeacher } from "@/lib/auth/use-personas";

import { updateStudent } from "../api/students-api";

export function useUpdateStudent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => updateStudent(id, payload),
    onSuccess: () => {
      // Both keys: the detail page shows the edited record, and the directory
      // list shows gender and enrollment status, which are editable here.
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// Mirrors the backend's CanEditStudentProfile exactly: an admin holding
// edit_students, OR any teacher.
//
// The teacher branch is easy to miss and would be wrong to drop — the backend
// deliberately lets any teacher record e.g. a medical note for a student they
// don't formally teach, so gating the UI on the permission string alone would
// hide an action teachers are entitled to.
export function useCanEditStudent(): boolean {
  const isAdminWithPermission = useHasSchoolPermission("edit_students");
  const isTeacher = useIsTeacher();
  return isAdminWithPermission || isTeacher;
}
