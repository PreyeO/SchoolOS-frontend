"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { createParentStudentLink } from "../api/parent-student-links-api";

// Callers (Student and Parent detail pages) invalidate their own detail
// query on success — this hook doesn't know which side initiated the link.
export function useCreateParentStudentLink() {
  return useMutation({
    mutationFn: createParentStudentLink,
    onSuccess: () => {
      toast.success("Linked");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
