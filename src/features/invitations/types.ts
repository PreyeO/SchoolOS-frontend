export type Gender = "male" | "female" | "other";
export type TeacherType = "class" | "subject" | "both";

export interface Role {
  id: string;
  name: string;
  permissions: string[];
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
