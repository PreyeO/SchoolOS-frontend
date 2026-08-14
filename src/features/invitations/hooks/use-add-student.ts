"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { addStudent } from "../api/invitations-api";
import type { AddStudentFormValues } from "../schemas/add-student-schema";

// No success toast here — success renders the credentials result screen
// instead (the response has no `detail`, just the created student).
export function useAddStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: AddStudentFormValues) => addStudent(values),
    onSuccess: () => {
      // Not the pending-invite list: a student is created outright, with no
      // InviteToken behind it. What does change is the directory and — because
      // the same call writes an enrollment — the arm's register roster.
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
