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
  class_id: string;
  class_name: string;
}

export interface MeSubjectAssignment {
  id: string;
  subject: SubjectResponse;
  class_arm_id: string;
  class_name: string;
  arm_name: string;
  created_at: string;
}

export interface MeTeacherBlock {
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
