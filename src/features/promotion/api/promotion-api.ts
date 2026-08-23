import { apiClient } from "@/lib/api/client";
import { CLASS_ARM_ENDPOINTS } from "@/lib/api/endpoints";

import type { PromotePayload, PromotedEnrollment, PromotionPreviewItem } from "../types";

// Plain arrays, not paginated — both actions return a bare list.

// Every student whose current enrollment for the source session is this arm,
// ordered by admission number. A student who transferred out mid-session has a
// newer enrollment row pointing elsewhere and so is absent, even though they
// once sat here.
export async function getPromotionPreview(
  classArmId: string,
  targetSessionId: string,
  sourceSessionId?: string,
): Promise<PromotionPreviewItem[]> {
  const { data } = await apiClient.get<PromotionPreviewItem[]>(
    CLASS_ARM_ENDPOINTS.PROMOTE_PREVIEW(classArmId),
    {
      params: {
        target_session_id: targetSessionId,
        ...(sourceSessionId ? { source_session_id: sourceSessionId } : {}),
      },
    },
  );
  return data;
}

// Inserts one Enrollment per assignment for the target session — it does not
// mutate the source-session rows, so a student's history is preserved and
// "current" for a session stays the most recent row.
//
// Every check runs before any write, so a 400 means nothing was created and the
// whole payload can be corrected and resent.
export async function promoteStudents(
  classArmId: string,
  payload: PromotePayload,
): Promise<PromotedEnrollment[]> {
  const { data } = await apiClient.post<PromotedEnrollment[]>(
    CLASS_ARM_ENDPOINTS.PROMOTE(classArmId),
    payload,
  );
  return data;
}
