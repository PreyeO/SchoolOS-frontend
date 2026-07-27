export type Gender = "male" | "female" | "other";
export type TeacherType = "class" | "subject" | "both";

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  is_owner: boolean;
}

// GET /api/school-admin-roles is paginated (DRF default); we only surface the
// first page of results in the role picker — schools aren't expected to have
// enough custom roles for pagination to matter in practice.
export interface RolesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Role[];
}

export interface DetailResponse {
  detail: string | string[];
}

export interface InviteAdminPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  role_id: string;
}

export interface InviteTeacherPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  teacher_type: TeacherType;
}

export interface InviteParentPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
}

export interface AddStudentPayload {
  first_name: string;
  last_name: string;
  admission_number: string;
  password: string;
  gender: Gender;
  date_of_birth?: string;
  email?: string;
}

export interface StudentCreatedResponse {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  subdomain: string;
  admission_number: string;
  gender: Gender;
  date_of_birth: string | null;
  password: string;
}

// --- Pending invites (GET /api/invites/, POST /api/invites/:id/resend/) ---
export type InvitePersona = "admin" | "teacher" | "parent" | "student";
export type InviteStatus = "pending" | "accepted" | "expired";

export interface InviteRoleSummary {
  id: string;
  name: string;
  permissions: string[];
}

export interface PendingInvite {
  id: string;
  token: string;
  email: string;
  persona: InvitePersona;
  school_admin_role: InviteRoleSummary | null;
  status: InviteStatus;
  expires_at: string;
  created_at: string;
}

export interface PendingInvitesFilters {
  persona?: InvitePersona;
  status?: InviteStatus;
  search?: string;
}

// --- Accept invite (GET /api/invites/:token/, POST /api/invites/accept/) ---
// Public — no auth required. has_password tells the frontend whether to show
// the password-creation UI (a brand-new invitee) or just an "Accept" button
// (an existing user, e.g. already staff at another school, invited here too).
export interface InviteDetailResponse {
  school: { name: string; slug: string; subdomain: string };
  persona: InvitePersona;
  email: string;
  has_password: boolean;
}

export interface AcceptInvitePayload {
  token: string;
  password?: string;
  confirm_password?: string;
}
