import { apiClient } from "@/lib/api/client";
import { CLASS_ARM_ENDPOINTS } from "@/lib/api/endpoints";
import type { ClassTeacherSummary } from "@/lib/school/class-record";
import type { StudentListItem } from "@/features/students/types";
import type { ClassArmSubject } from "@/features/teaching-assignments/types";

// Everything about one class arm in a single request: which class it belongs to,
// who teaches it, what it's taught, and who is in it.
//
// Worth knowing it exists — the same picture used to need three separate calls
// (arm subjects, subject assignments, students filtered by arm), and screens
// that already assemble it that way still do. This is the one-call version.
//
// `students` is the CURRENT roster: the latest enrolment for the school's
// current session, so a mid-session transfer appears under the arm they're in
// now. With no term marked current it comes back empty rather than erroring.
export interface ClassArmDetail {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  class_id: string;
  class_name: string;
  level: string;
  class_teacher: ClassTeacherSummary | null;
  subjects: ClassArmSubject[];
  students: StudentListItem[];
}

// Requires only school membership — the retrieve action sets no permission
// string, so a teacher can open this as well as an admin.
export async function getClassArmDetail(id: string): Promise<ClassArmDetail> {
  const { data } = await apiClient.get<ClassArmDetail>(CLASS_ARM_ENDPOINTS.DETAIL(id));
  return data;
}
