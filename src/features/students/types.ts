import type { MembershipSummary, SchoolContextSummary, UserDetail, UserMinimal } from "@/lib/api/profile-summary";
import type { ClassArmRecord } from "@/lib/school/class-record";
import type { RelationshipType } from "@/features/parent-student-links/types";

export type Gender = "male" | "female" | "other";
export type EnrollmentStatus = "active" | "graduated" | "transferred" | "withdrawn" | "suspended" | "expelled";
export type Religion = "christian" | "islam" | "other";
export type Genotype = "aa" | "bb" | "ab" | "oo" | "unknown";
export type BloodGroup =
  | "a_positive"
  | "a_negative"
  | "b_positive"
  | "b_negative"
  | "ab_positive"
  | "ab_negative"
  | "o_positive"
  | "o_negative"
  | "unknown";

// The student's class/arm for the school's current session. Null when they have
// no enrollment in it — or when no period is marked is_current at all.
export interface CurrentClass {
  class_arm_id: string;
  class_name: string;
  arm_name: string;
  // See MeClassArm — the placeholder arm, hidden behind the class name.
  is_default: boolean;
  session: string;
}

export interface StudentListItem {
  id: string;
  user: UserMinimal;
  admission_number: string;
  gender: Gender;
  enrollment_status: EnrollmentStatus;
  date_of_admission: string | null;
  current_class: CurrentClass | null;
  created_at: string;
}

export interface StudentParentLink {
  id: string;
  parent_id: string;
  parent_name: string;
  email: string;
  relationship: RelationshipType;
  is_primary_contact: boolean;
}

export interface StudentDetail {
  id: string;
  user: UserDetail;
  membership: MembershipSummary;
  school: SchoolContextSummary;
  admission_number: string;
  date_of_birth: string | null;
  gender: Gender;
  nationality: string | null;
  state_of_origin: string | null;
  religion: Religion | null;
  blood_group: BloodGroup | null;
  genotype: Genotype | null;
  allergies: string | null;
  chronic_conditions: string | null;
  disabilities: string | null;
  emergency_medications: string | null;
  favourite_food: string | null;
  hobbies: string | null;
  ambitions: string | null;
  enrollment_status: EnrollmentStatus;
  date_of_admission: string | null;
  previous_school: string | null;
  photo: string | null;
  parent_links: StudentParentLink[];
  current_class: CurrentClass | null;
  created_at: string;
}

// One row of a student's enrollment history. History is never collapsed per
// session — a mid-session transfer adds a row rather than replacing one, so the
// same session can appear more than once, newest first.
export interface EnrollmentRecord {
  id: string;
  class_arm: ClassArmRecord;
  class_name: string;
  session: string;
  created_at: string;
}

export interface StudentFilters {
  search?: string;
  gender?: Gender;
  enrollment_status?: EnrollmentStatus;
  is_active?: boolean;
  // Students whose *current* class arm is this one — resolved server-side to the
  // latest enrollment in the current session, so mid-session transfers land in
  // the right register. Returns nothing when no period is marked is_current.
  class_arm_id?: string;
  page?: number;
  page_size?: number;
}
