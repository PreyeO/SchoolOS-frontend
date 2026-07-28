import type { MembershipSummary, SchoolContextSummary, UserDetail, UserMinimal } from "@/lib/api/profile-summary";

export type TeacherType = "class" | "subject" | "both";

export interface TeacherListItem {
  id: string;
  user: UserMinimal;
  employee_id: string | null;
  teacher_type: TeacherType;
  specialization: string | null;
  created_at: string;
}

export interface TeacherDetail {
  id: string;
  user: UserDetail;
  membership: MembershipSummary;
  school: SchoolContextSummary;
  employee_id: string | null;
  qualification: string | null;
  specialization: string | null;
  date_joined_school: string | null;
  teacher_type: TeacherType;
  created_at: string;
}

export interface TeacherFilters {
  search?: string;
  teacher_type?: TeacherType;
  is_active?: boolean;
  page?: number;
}
