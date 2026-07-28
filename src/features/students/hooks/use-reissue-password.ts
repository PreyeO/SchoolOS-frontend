"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { reissueStudentPassword } from "../api/students-api";

export function useReissuePassword(id: string) {
  return useMutation({
    mutationFn: (password: string) => reissueStudentPassword(id, password),
    onSuccess: () => {
      toast.success("Password reissued");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
