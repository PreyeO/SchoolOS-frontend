import type { IssuanceChannel, IssuancePreviewPayload, IssuanceTarget } from "../types";

export interface TargetInput {
  sessionId: string;
  channel: IssuanceChannel;
  scope: "school" | "class" | "arm" | "selection";
  classId: string;
  armId: string;
  studentIds: string[];
}

// The request body for the current form, or null while a required choice is
// missing (no class picked yet, nobody chosen), so Check can't be pressed.
export function toPreviewPayload(input: TargetInput): IssuancePreviewPayload | null {
  if (!input.sessionId) return null;
  let target: IssuanceTarget;
  switch (input.scope) {
    case "school":
      target = { scope: "school" };
      break;
    case "class":
      if (!input.classId) return null;
      target = { scope: "class", class_id: input.classId };
      break;
    case "arm":
      if (!input.armId) return null;
      target = { scope: "arm", class_arm_id: input.armId };
      break;
    case "selection":
      if (input.studentIds.length === 0) return null;
      target = { scope: "selection", student_ids: input.studentIds };
      break;
  }
  return { ...target, academic_session_id: input.sessionId, channel: input.channel };
}

// Identifies "the same issuance". The idempotency key is kept while this stays
// the same (re-checking after adding a number, retrying a commit whose
// response was lost) and replaced when it changes, because the server rejects
// a key reused for a different session, channel or scope.
export function issuanceFingerprint(payload: IssuancePreviewPayload): string {
  const ids = "student_ids" in payload ? [...payload.student_ids].sort() : [];
  return JSON.stringify({ ...payload, ...(ids.length ? { student_ids: ids } : {}) });
}
