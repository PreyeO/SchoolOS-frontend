import type { ClassTeacherSummary } from "@/lib/school/class-record";
import type { SubjectResponse } from "@/features/onboarding/types";

// One teacher teaching one subject to one class arm. Several teachers may hold
// the same (class_arm, subject) pair — a school splitting a big arm's load — so
// this is a list per subject, not a single value.
export interface SubjectAssignment {
  id: string;
  subject: SubjectResponse;
  // Same {id, name, email} shape the class teacher uses; `id` is the
  // TeacherProfile id, which is what the create body wants.
  teacher: ClassTeacherSummary;
  class_arm_id: string;
  class_name: string;
  arm_name: string;
  created_at: string;
}

export interface CreateSubjectAssignmentPayload {
  class_arm_id: string;
  subject_id: string;
  teacher_profile_id: string;
}
