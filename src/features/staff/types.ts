import type { MembershipSummary, SchoolContextSummary, UserDetail, UserMinimal } from "@/lib/api/profile-summary";

export type TeacherType = "class" | "subject" | "both";

// Only these two can be a class teacher — the backend rejects 'subject'
// (AcademicService.assign_class_teacher). Used to filter the assign picker so a
// subject-only teacher is never offered and then refused.
export const CLASS_TEACHER_TYPES: TeacherType[] = ["class", "both"];

export function canBeClassTeacher(teacher: { teacher_type: TeacherType }): boolean {
  return CLASS_TEACHER_TYPES.includes(teacher.teacher_type);
}

// The arms this teacher is class teacher of, as embedded on teacher list/detail
// responses. The reverse of ClassArm.class_teacher — both sides must be
// refetched after an assign/unassign or the two views disagree.
export interface TeacherClassArm {
  id: string;
  name: string;
  // See MeClassArm — the placeholder arm, hidden behind the class name.
  is_default: boolean;
  class_id: string;
  class_name: string;
}

export interface TeacherListItem {
  id: string;
  user: UserMinimal;
  employee_id: string | null;
  teacher_type: TeacherType;
  specialization: string | null;
  class_arms: TeacherClassArm[];
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
  class_arms: TeacherClassArm[];
  created_at: string;
}

// PATCH /teachers/:id/ body. Send only what changed. The first group is the
// teacher's User; the second is the staff record, which needs edit_staff —
// a teacher editing themselves who includes any of it gets a 403 and
// nothing is saved. phone_number "" clears it; photo_key "" removes the photo.
export interface TeacherUserFields {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  photo_key?: string;
}

export interface TeacherStaffFields {
  employee_id?: string;
  qualification?: string;
  specialization?: string;
  teacher_type?: TeacherType;
}

export type TeacherUpdatePayload = TeacherUserFields & TeacherStaffFields;

export interface TeacherFilters {
  search?: string;
  teacher_type?: TeacherType;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}
