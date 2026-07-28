import type { SchoolLevelValue } from "@/data/school-levels";
import type { SchoolType } from "@/features/auth/types";

// Shared shapes embedded identically across the Staff/Student/Parent
// directory list + detail responses (accounts/serializers.py's
// UserMinimalSerializer/UserDetailSerializer/MembershipSummarySerializer/
// SchoolSummarySerializer). One definition, reused by all three features.
export interface UserMinimal {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  photo: string | null;
}

export interface UserDetail extends UserMinimal {
  is_email_verified: boolean;
  created_at: string;
}

export interface MembershipSummary {
  id: string;
  is_admin: boolean;
  is_teacher: boolean;
  is_parent: boolean;
  is_student: boolean;
  is_active: boolean;
  created_at: string;
}

// Named distinctly from features/auth's SchoolSummary (login's school-selection
// shape, which omits school_type/levels/city/state) — this is the richer
// context embedded in profile detail views.
export interface SchoolContextSummary {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  school_type: SchoolType;
  levels: SchoolLevelValue[];
  city: string;
  state: string;
}
