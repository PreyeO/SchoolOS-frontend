"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { submitDemoRequest } from "../api/demo-requests-api";
import type { DemoRequestPayload } from "../types";

// No query invalidation and no success toast: nothing on a public marketing
// page reads this back, and the confirmation is a full screen state rather than
// a toast that disappears. Errors do toast, through the shared normalizer, so
// the backend's own detail reaches the visitor.
export function useSubmitDemoRequest() {
  return useMutation({
    mutationFn: (payload: DemoRequestPayload) => submitDemoRequest(payload),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
