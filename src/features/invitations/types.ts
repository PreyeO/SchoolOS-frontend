export type Gender = "male" | "female" | "other";
export type TeacherType = "class" | "subject" | "both";

export interface Role {
  id: string;
  name: string;
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
