"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { getSchoolId } from "@/lib/school/get-school-id";

import { updateStudentCapacity } from "../api/capacity-api";
import { SCHOOL_PROFILE_QUERY_KEY } from "./use-school-profile";

export function useUpdateCapacity() {
  const queryClient = useQueryClient();
  const schoolId = getSchoolId();

  return useMutation({
    mutationFn: (studentCapacity: number) =>
      updateStudentCapacity(schoolId as string, studentCapacity),
    onSuccess: () => {
      // The school profile carries student_capacity, so it's stale the moment
      // this lands. Bulk import reads capacity too — its 400 names the old
      // ceiling — so the students list is refreshed for the same reason.
      queryClient.invalidateQueries({ queryKey: SCHOOL_PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    // No success toast: a chargeable increase returns an amount the admin has
    // to actually read, so the caller renders the outcome inline instead of
    // flashing it past them in a toast.
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
