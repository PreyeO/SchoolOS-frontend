import type { MembershipSummary, SchoolContextSummary, UserDetail, UserMinimal } from "@/lib/api/profile-summary";

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

export interface StudentListItem {
  id: string;
  user: UserMinimal;
  admission_number: string;
  gender: Gender;
  enrollment_status: EnrollmentStatus;
  created_at: string;
}

export interface StudentParentLink {
  id: string;
  parent_id: string;
  parent_name: string;
  email: string;
  relationship: string;
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
  created_at: string;
}

export interface StudentFilters {
  search?: string;
  gender?: Gender;
  enrollment_status?: EnrollmentStatus;
  is_active?: boolean;
  page?: number;
}
