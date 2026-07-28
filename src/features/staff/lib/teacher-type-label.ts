import type { TeacherType } from "../types";

const LABELS: Record<TeacherType, string> = {
  class: "Class teacher",
  subject: "Subject teacher",
  both: "Class & subject",
};

export function teacherTypeLabel(type: TeacherType): string {
  return LABELS[type];
}
