// Split from the former single results/types.ts along the section banners
// it already used as seams. Re-exported from ../types so no import changed.

import type { StudentListItem } from "@/features/students/types";
import type { UserMinimal } from "@/lib/api/profile-summary";

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
