// Split from the former single results/types.ts along the section banners
// it already used as seams. Re-exported from ../types so no import changed.

import type { StudentListItem } from "@/features/students/types";
import type { UserMinimal } from "@/lib/api/profile-summary";

import type { StudentResultRemark } from "./remarks";
import type { StudentTraitRating } from "./traits";


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
