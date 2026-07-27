import type { InvitePersona } from "../types";

const LABELS: Record<InvitePersona, string> = {
  admin: "School admin",
  teacher: "Teacher",
  parent: "Parent",
  student: "Student",
};

export function personaLabel(persona: InvitePersona): string {
  return LABELS[persona];
}
