import type { AttendanceRecord, AttendanceStatus } from "@/features/attendance/types";
import type { MeResponse } from "@/features/me/types";
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

// Signs a membership in, as the token's claims would after login.
export function signInAs(membershipId: string, personas: string[] = ["teacher"]): void {
  useAuthStore.setState({
    claims: {
      user_id: `user-${membershipId}`,
      school_id: "school-1",
      membership_id: membershipId,
      personas,
      is_platform_admin: false,
    },
  });
}

// A GET /api/auth/me/ body for that membership. `permissions` is the admin
// role's list, and only applies when "admin" is among the personas.
export function meResponse(
  membershipId: string,
  personas: string[],
  permissions: string[] = [],
): MeResponse {
  const has = (p: string) => personas.includes(p);
  return {
    state: "complete",
    membership: {
      id: membershipId,
      is_admin: has("admin"),
      is_teacher: has("teacher"),
      is_parent: has("parent"),
      is_student: has("student"),
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    },
    ...(has("admin") ? { admin: { school_admin_role: { permissions, is_owner: false } } } : {}),
  } as unknown as MeResponse;
}
