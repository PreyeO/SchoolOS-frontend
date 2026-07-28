import type { MembershipSummary, SchoolContextSummary, UserDetail, UserMinimal } from "@/lib/api/profile-summary";

export interface ParentListItem {
  id: string;
  user: UserMinimal;
  occupation: string | null;
  created_at: string;
}

export interface ParentStudentLink {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  relationship: string;
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
  student_links: ParentStudentLink[];
  created_at: string;
}

export interface ParentFilters {
  search?: string;
  state?: string;
  is_active?: boolean;
  page?: number;
}
