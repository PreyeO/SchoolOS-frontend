import type { MembershipSummary, SchoolContextSummary, UserDetail } from "@/lib/api/profile-summary";
import type { SubjectResponse } from "@/features/onboarding/types";
import type { CurrentClass } from "@/features/students/types";
import type { RelationshipType } from "@/features/parent-student-links/types";

// GET /api/auth/me/ — the caller's own context, one block per active persona.
// Blocks are present only when that persona is active on the membership, so a
// teacher who is also a parent gets both.

// Verified against the live payload: /me embeds SchoolSummarySerializer, which
// is the same eight fields the profile detail views use — not a slimmer shape.

export interface MeAdminBlock {
  school_admin_role: {
    id: string;
    name: string;
    permissions: string[];
    is_owner: boolean;
  } | null;
}

// An arm this teacher is the class teacher (form teacher) of. Distinct from a
// subject assignment — a form teacher may take no subjects in their own arm.
export interface MeClassArm {
  id: string;
  name: string;
  // True for the system placeholder arm a class gets when it has none of its
  // own. Its name is literally "Default", which must never reach a teacher.
  is_default: boolean;
  class_id: string;
  class_name: string;
}

export interface MeSubjectAssignment {
  id: string;
  subject: SubjectResponse;
  class_arm_id: string;
  class_name: string;
  arm_name: string;
  // See MeClassArm — the placeholder arm, shown as its class name.
  is_default: boolean;
  created_at: string;
}

export interface MeTeacherBlock {
  // The caller's own TeacherProfile id. Needed to tell "my note" from
  // "someone else's" on a student's notes — StudentNote.author.id is a
  // TeacherProfile id, and only the author may edit their own note.
  id: string;
  class_arms: MeClassArm[];
  subject_assignments: MeSubjectAssignment[];
}

export interface MeChildLink {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  relationship: RelationshipType;
  is_primary_contact: boolean;
}

export interface MeParentBlock {
  student_links: MeChildLink[];
}

export interface MeGuardianLink {
  id: string;
  parent_id: string;
  parent_name: string;
  email: string;
  relationship: RelationshipType;
  is_primary_contact: boolean;
}

export interface MeStudentBlock {
  // The caller's own StudentProfile id — added 2026-08-29. Everything
  // student-facing keys off it (/students/<id>/fees/, /report-card/,
  // attendance), and before it existed the frontend had to find it by
  // scanning the class roster. See use-my-student-id.
  id: string;
  current_class: CurrentClass | null;
  parent_links: MeGuardianLink[];
}

export interface MeResponse {
  state: "verify_email" | "create_school" | "complete";
  user: UserDetail;
  school: SchoolContextSummary;
  membership: MembershipSummary;
  admin?: MeAdminBlock;
  teacher?: MeTeacherBlock;
  parent?: MeParentBlock;
  student?: MeStudentBlock;
}
