import { z } from "zod";

import { nameField, optionalPhoneNumber } from "@/features/invitations/schemas/shared";

import type { TeacherType, TeacherUpdatePayload } from "../types";

// Mirrors TeacherProfileUpdateSerializer's lengths. Same name and phone rules
// as the invite-teacher form, so an edit can't fail a check the invite passed.
// The staff-record fields are always present in the form values but only
// sent when the dialog is in admin mode (see toTeacherPayload).
export const teacherEditSchema = z.object({
  first_name: nameField.max(100, "Keep this under 100 characters"),
  last_name: nameField.max(100, "Keep this under 100 characters"),
  phone_number: optionalPhoneNumber,
  employee_id: z.string().trim().max(50, "Keep this under 50 characters"),
  qualification: z.string().trim().max(255, "Keep this under 255 characters"),
  specialization: z.string().trim().max(100, "Keep this under 100 characters"),
  teacher_type: z.enum(["class", "subject", "both"]),
});

export type TeacherEditValues = z.infer<typeof teacherEditSchema>;

const USER_KEYS = ["first_name", "last_name", "phone_number"] as const;
const STAFF_KEYS = ["employee_id", "qualification", "specialization", "teacher_type"] as const;

// Only what changed, because the handoff asks for it and because a teacher
// in self mode must never send a staff-record key at all: one would 403 the
// whole request. Blank text is sent as "" (the serializer allows blank on all
// of these, and "" is how phone_number is cleared), trimmed first.
export function toTeacherPayload(
  values: TeacherEditValues,
  initial: TeacherEditValues,
  includeStaffRecord: boolean,
): TeacherUpdatePayload {
  const keys = includeStaffRecord ? [...USER_KEYS, ...STAFF_KEYS] : USER_KEYS;
  const payload: Record<string, string> = {};
  for (const key of keys) {
    const next = String(values[key] ?? "").trim();
    if (next !== String(initial[key] ?? "").trim()) payload[key] = next;
  }
  return payload as TeacherUpdatePayload;
}

// Mirrors the two teacher_type guards in UserService.update_teacher_profile,
// so the dialog can say what's in the way before the 400 does. Only a CHANGE
// is checked, as on the server, and "both" is always allowed. Advisory only:
// classesLed matches the server (detail's class_arms is active-only), but the
// subject-assignment list includes retired arms, which the server ignores.
export function teacherTypeBlocker(
  from: TeacherType,
  to: TeacherType,
  counts: { subjectAssignments: number; classesLed: number },
): string | null {
  if (to === from || to === "both") return null;
  if (to === "class" && counts.subjectAssignments > 0) {
    return `They still teach ${counts.subjectAssignments} subject ${counts.subjectAssignments === 1 ? "assignment" : "assignments"}. Remove those in Teaching Assignments first, or choose Form & subject.`;
  }
  if (to === "subject" && counts.classesLed > 0) {
    return `They're still form teacher of ${counts.classesLed} ${counts.classesLed === 1 ? "class" : "classes"}. Unassign them in Classes & Arms first, or choose Form & subject.`;
  }
  return null;
}
