import type { AttendanceRecord, AttendanceStatus } from "@/features/attendance/types";
import type { Score } from "@/features/results/types";
import type { StudentListItem } from "@/features/students/types";
import { useAuthStore } from "@/stores/auth-store";

// Minimal API rows for hook tests. Each fills only the fields the code under
// test reads; the casts are deliberate, so a fixture doesn't have to grow every
// time a serializer gains a field the logic never touches.

export function student(id: string): StudentListItem {
  return { id, user: { id: `u-${id}`, first_name: id, last_name: "Test" } } as unknown as StudentListItem;
}

export function roster(...ids: string[]): StudentListItem[] {
  return ids.map(student);
}

export function score(studentId: string, gradeComponentId: string, value: string): Score {
  return {
    id: `score-${studentId}-${gradeComponentId}`,
    student: student(studentId),
    grade_component: gradeComponentId,
    score_obtained: value,
  } as unknown as Score;
}

export function record(studentId: string, status: AttendanceStatus, note: string | null = null): AttendanceRecord {
  return { id: `rec-${studentId}`, student: student(studentId), status, note } as unknown as AttendanceRecord;
}

// Signs a membership in for hooks that scope device storage by it.
export function signInAs(membershipId: string): void {
  useAuthStore.setState({
    claims: {
      user_id: `user-${membershipId}`,
      school_id: "school-1",
      membership_id: membershipId,
      personas: ["teacher"],
      is_platform_admin: false,
    },
  });
}
