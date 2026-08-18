import type { SubjectResponse } from "@/features/onboarding/types";
import type { StudentListItem } from "@/features/students/types";
import type { UserMinimal } from "@/lib/api/profile-summary";

// DRAFT and SUBMITTED are both still editable; REJECTED is sent back for
// correction and also editable. Only APPROVED hard-locks — and it locks the
// whole batch, not individual rows (see bulkEnterScores).
export const SUBMISSION_STATUSES = ["draft", "submitted", "approved", "rejected"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export interface ResultSubmission {
  id: string;
  class_arm: string;
  class_name: string;
  arm_name: string;
  subject: string;
  subject_name: string;
  academic_period: string;
  status: SubmissionStatus;
  submitted_by: UserMinimal | null;
  submitted_at: string | null;
  reviewed_by: UserMinimal | null;
  reviewed_at: string | null;
  review_comment: string | null;
}

// One student's score on one grade component. component_name and
// component_max_obtainable are snapshots taken at entry time, so a later change
// to the school's grading setup never rewrites a historical score — read those
// rather than the live GradeComponent when displaying what was recorded.
export interface Score {
  id: string;
  student: StudentListItem;
  subject: SubjectResponse;
  grade_component: string | null;
  component_name: string;
  component_max_obtainable: number;
  // DecimalField over the wire — a string, not a number.
  score_obtained: string;
  entered_by: UserMinimal | null;
  marked_at: string | null;
  updated_at: string;
}

export interface ScoreEntryItem {
  student_id: string;
  grade_component_id: string;
  score: number;
  // Client-side, stamped when the teacher saves rather than when the request
  // flushes. Drives last-write-wins server-side, so a score entered at 09:00 and
  // synced at 17:00 must not beat a colleague's 15:00 correction.
  marked_at: string;
}

export interface BulkScoreEntryPayload {
  class_arm_id: string;
  subject_id: string;
  academic_period_id: string;
  entries: ScoreEntryItem[];
}

// A 200 with a non-empty `skipped` is a partial success: those entries lost the
// last-write-wins comparison. Distinct from a 400, which rejects the whole batch
// — the APPROVED lock works that way.
export interface BulkScoreEntryResponse {
  applied: Score[];
  skipped: { student_id: string; grade_component_id: string; reason: string }[];
}

export interface ScoreFilters {
  class_arm_id: string;
  subject_id: string;
  academic_period_id: string;
}

