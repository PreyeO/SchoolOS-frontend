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

// ── Behaviour traits and ratings ────────────────────────────────────────────

// Nigerian report cards group behaviour under two headings. Affective is
// attitude and social conduct (punctuality, neatness, politeness); psychomotor
// is physical and practical skill (handwriting, sports, craft).
export const TRAIT_CATEGORIES = ["affective", "psychomotor"] as const;
export type TraitCategory = (typeof TRAIT_CATEGORIES)[number];

export interface BehavioralTrait {
  id: string;
  level: string;
  category: TraitCategory;
  name: string;
  order: number;
  // A trait that already has ratings is deactivated rather than deleted, so
  // historical report cards keep their wording. Read-only.
  is_active: boolean;
}

export interface CreateTraitsPayload {
  level: string;
  category: TraitCategory;
  traits: { name: string; order: number }[];
}

export interface StudentTraitRating {
  id: string;
  student: StudentListItem;
  trait: BehavioralTrait | null;
  // Snapshots taken at rating time, so changing a trait's wording later never
  // rewrites what a past report card said.
  trait_name: string;
  trait_category: TraitCategory;
  rating: number;
  rated_by: UserMinimal | null;
  marked_at: string | null;
  updated_at: string;
}

export interface TraitRatingItem {
  student_id: string;
  trait_id: string;
  // 1-5, enforced by the serializer.
  rating: number;
  marked_at: string;
}

export interface BulkTraitRatingPayload {
  class_arm_id: string;
  academic_period_id: string;
  entries: TraitRatingItem[];
}

export interface BulkTraitRatingResponse {
  applied: StudentTraitRating[];
  skipped: { student_id: string; trait_id: string; reason: string }[];
}

// ── Remarks ─────────────────────────────────────────────────────────────────

// One row per (student, term) carrying both remarks. They're written by
// different people at different times — the form teacher and the principal — so
// each has its own author and timestamp, stamped server-side.
export interface StudentResultRemark {
  id: string;
  student: StudentListItem;
  class_arm: string;
  academic_period: string;
  class_teacher_remark: string | null;
  class_teacher_remark_by: UserMinimal | null;
  class_teacher_remark_at: string | null;
  principal_remark: string | null;
  principal_remark_by: UserMinimal | null;
  principal_remark_at: string | null;
}

export interface SetRemarkPayload {
  student_id: string;
  class_arm_id: string;
  academic_period_id: string;
  remark: string;
}

// ── Report cards ────────────────────────────────────────────────────────────

// One subject's aggregate for a student in a term. Positions are only filled in
// once the arm's broadsheet is locked — that's when they're computed.
export interface StudentSubjectResult {
  id: string;
  subject: string;
  subject_name: string;
  total_score: string;
  grade: string | null;
  remark: string | null;
  grading_system_name: string | null;
  subject_position_in_arm: number | null;
  subject_position_in_class: number | null;
  computed_at: string;
}

// Overall standing, distinct from any single subject's position. Null until the
// broadsheet is locked — summaries are only populated at lock time.
export interface StudentResultSummary {
  id: string;
  total_score: string;
  average_score: string;
  position_in_arm: number | null;
  position_in_class: number | null;
  cumulative_average: string | null;
  computed_at: string;
}

export interface ReportCard {
  student: StudentListItem;
  academic_period_id: string;
  subjects: StudentSubjectResult[];
  // Both null before the arm is locked, or if the student has no results at all.
  summary: StudentResultSummary | null;
  remark: StudentResultRemark | null;
  trait_ratings: StudentTraitRating[];
}

// The broadsheet lock state for one (arm, term). is_locked is derived from
// locked_at rather than stored, so there's no separate status to drift.
export interface ClassArmResult {
  id: string;
  class_arm: string;
  academic_period: string;
  is_locked: boolean;
  locked_by: UserMinimal | null;
  locked_at: string | null;
}

// A class arm's whole term on one grid: every student, every subject.
//
// Two things about `rows` that shape the UI. It's built server-side from the
// StudentSubjectResult rows that exist, so a student with no scores at all is
// absent from it entirely rather than present-and-empty — the screen
// reconciles against the roster so those children still appear. And it carries
// no ordering, so sorting is the client's job.
export interface BroadsheetRow {
  student: StudentListItem;
  subjects: StudentSubjectResult[];
  // Null until the arm is locked; positions and averages don't exist before.
  summary: StudentResultSummary | null;
}

export interface Broadsheet {
  class_arm_id: string;
  academic_period_id: string;
  is_locked: boolean;
  rows: BroadsheetRow[];
}

// The leaderboard endpoints return the same two models as the report card, but
// standalone rather than nested under a student — so each row carries its own
// student, which the report-card shapes above omit as redundant.
export interface LeaderboardOverallRow extends StudentResultSummary {
  student: StudentListItem;
}

export interface LeaderboardSubjectRow extends StudentSubjectResult {
  student: StudentListItem;
}

export interface ReportCardSettings {
  id: string;
  level: string;
  enabled_sections: string[];
  template_key: string;
  font_pairing: string;
  logo_placement: string;
  border_style: string;
  show_watermark: boolean;
  updated_at: string;
}

export interface ReportCardOption {
  key: string;
  label: string;
}

export interface ReportCardOptions {
  sections: ReportCardOption[];
  templates: ReportCardOption[];
  font_pairings: ReportCardOption[];
  logo_placements: ReportCardOption[];
  border_styles: ReportCardOption[];
}
