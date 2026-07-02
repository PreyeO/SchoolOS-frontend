"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { addStudent } from "../api/invitations-api";
import type { AddStudentFormValues } from "../schemas/add-student-schema";

// No success toast here — success renders the credentials result screen
// instead (the response has no `detail`, just the created student).
export function useAddStudent() {
  return useMutation({
    mutationFn: (values: AddStudentFormValues) => addStudent(values),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
