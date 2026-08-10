"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { enrollStudent, getEnrollmentHistory } from "../api/students-api";

export function useEnrollmentHistory(studentId: string) {
  return useQuery({
    queryKey: ["students", studentId, "enrollment-history"],
    queryFn: () => getEnrollmentHistory(studentId),
  });
}

export function useEnrollStudent(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classArmId: string) => enrollStudent(studentId, classArmId),
    onSuccess: () => {
      // The student's own detail carries current_class, and their register
      // membership changes too — invalidate both so neither view goes stale.
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Student enrolled");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
