import type { SubjectResponse } from "@/features/onboarding/types";

// A deactivated subject keeps existing so its scores and offerings still point
// at something, but every write path rejects it — offering it on an arm,
// assigning a teacher, entering scores all 400 with "Subject not found in this
// school." So it must never reach a picker that feeds one of those.
//
// Missing flag means active: a response predating the field describes a live
// subject, and defaulting the other way would empty every picker.
export function isActiveSubject(subject: Pick<SubjectResponse, "is_active">): boolean {
  return subject.is_active !== false;
}
