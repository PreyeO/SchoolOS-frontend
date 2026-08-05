import type { MembershipSummary, SchoolContextSummary, UserDetail, UserMinimal } from "@/lib/api/profile-summary";
import type { InviteRoleSummary } from "@/features/invitations/types";

export interface AdminListItem {
  id: string;
  user: UserMinimal;
  school_admin_role: InviteRoleSummary | null;
  created_at: string;
}

export interface AdminDetail {
  id: string;
  user: UserDetail;
  membership: MembershipSummary;
  school: SchoolContextSummary;
  school_admin_role: InviteRoleSummary | null;
  date_joined_school: string | null;
  created_at: string;
}

export interface AdminFilters {
  search?: string;
  school_admin_role?: string;
  is_active?: boolean;
  page?: number;
}
