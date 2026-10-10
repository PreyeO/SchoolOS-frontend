import type { MembershipSummary, SchoolContextSummary, UserDetail, UserMinimal } from "@/lib/api/profile-summary";
import type { RelationshipType } from "@/features/parent-student-links/types";

export interface ParentListItem {
  id: string;
  user: UserMinimal;
  occupation: string | null;
  // False for an offboarded (former) parent.
  is_parent: boolean;
  created_at: string;
}

export interface ParentStudentLink {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  relationship: RelationshipType;
  is_primary_contact: boolean;
}

export interface ParentDetail {
  id: string;
  user: UserDetail;
  membership: MembershipSummary;
  school: SchoolContextSummary;
  occupation: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  date_joined_school: string | null;
  student_links: ParentStudentLink[];
  created_at: string;
}

export interface ParentFilters {
  search?: string;
  state?: string;
  is_active?: boolean;
  // Omit for current parents (the backend default); false for former ones.
  is_parent?: boolean;
  page?: number;
}
