"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { getPromotionPreview, promoteStudents } from "../api/promotion-api";
import type { PromotePayload } from "../types";

export const PROMOTION_QUERY_KEY = ["promotion"];

export function usePromotionPreview(
  classArmId: string | null | undefined,
  targetSessionId: string | null | undefined,
  sourceSessionId: string | null | undefined,
) {
  return useQuery({
    queryKey: [...PROMOTION_QUERY_KEY, "preview", classArmId, targetSessionId, sourceSessionId],
    queryFn: () =>
      getPromotionPreview(
        classArmId as string,
        targetSessionId as string,
        sourceSessionId ?? undefined,
      ),
    enabled: !!classArmId && !!targetSessionId,
    // The 400s here are all configuration mistakes — a session that isn't this
    // school's, or no current session to fall back on. Retrying can't fix any
    // of them and only delays the message that says what to do.
    retry: false,
  });
}

export function usePromoteStudents(classArmId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PromotePayload) => promoteStudents(classArmId as string, payload),
    onSuccess: (enrollments) => {
      // Enrollment drives the roster, every register, and the broadsheet's row
      // set, so all three are stale the moment this lands.
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["results"] });
      toast.success(
        `${enrollments.length} student${enrollments.length === 1 ? "" : "s"} promoted`,
      );
    },
    // The refusals name the students they're about — "not currently enrolled in
    // this class arm for the source session: [...]" — so the message is the
    // useful part and passing it through unchanged is the point.
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
