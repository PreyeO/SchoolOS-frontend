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

// One teacher, one arm, one or more subjects — a teacher commonly takes several
// subjects in the same class. Validated wholly before any write.
export interface CreateSubjectAssignmentPayload {
  class_arm_id: string;
  subject_ids: string[];
  teacher_profile_id: string;
}

// A subject this arm officially takes. Must exist before a teacher can be
// assigned to it — "offered" is a prerequisite of "taught". Also the set results
// uses to decide which subjects an arm's broadsheet must cover.
export interface ClassArmSubject {
  id: string;
  subject: SubjectResponse;
  class_arm_id: string;
  class_name: string;
  arm_name: string;
  created_at: string;
}

// Bulk by design: every check runs before any write, so a batch either lands
// whole or fails whole with one message naming what was wrong.
export interface CreateClassArmSubjectPayload {
  class_arm_id: string;
  subject_ids: string[];
}
