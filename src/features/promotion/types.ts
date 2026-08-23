import type { StudentListItem } from "@/features/students/types";

// One student's suggested destination, from PromotionPreviewItemSerializer.
//
// The two suggestion halves are independent, and the service is explicit that
// they mean different things when null:
//
//   class set, arm set    — a confident mapping; prefill both
//   class set, arm null   — target has several arms and none matched by name,
//                           trailing token or index. The admin must pick.
//   class null, arm null  — no next class at all: a terminal class, or the next
//                           level has no classes configured. Invent nothing.
//
// An arm of null must never be read as "use the default arm" — where a target
// class has only the system placeholder, _suggest_next_arm already returns that
// arm's id.
export interface PromotionPreviewItem {
  student: StudentListItem;
  current_class_arm_id: string;
  current_class_name: string;
  current_arm_name: string;
  suggested_class_id: string | null;
  suggested_class_name: string | null;
  suggested_class_arm_id: string | null;
  suggested_arm_name: string | null;
  // True when the student already holds any Enrollment row for the target
  // session. Preview is scoped to *source*-session enrolment, so promoting
  // someone doesn't drop them from it — without this the only way to know they
  // were already sent was to remember it, which a page reload lost.
  already_in_target_session: boolean;
}

export interface PromotionAssignment {
  student_id: string;
  class_arm_id: string;
}

export interface PromotePayload {
  // Required here, unlike preview — the service has no fallback on this path.
  source_session_id: string;
  target_session_id: string;
  // allow_empty=False on the serializer, so never send [].
  assignments: PromotionAssignment[];
}

// bulk_promote_students returns the newly created Enrollment rows. Only the
// student id is read — it's what marks a row as committed for this sitting.
export interface PromotedEnrollment {
  id: string;
  student: StudentListItem;
  class_name: string;
  session: string;
}
