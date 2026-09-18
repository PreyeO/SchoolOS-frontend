"use client";

import type { SwitchablePersona } from "./active-persona";
import { useActivePersona } from "./use-active-persona";

// The personas in effect right now — always exactly one, the active persona.
//
// Personas aren't exclusive on the membership (one person can be both an admin
// and a teacher), but the app works as one at a time: someone in teacher mode
// gets teacher screens, teacher copy and teacher gates, even though /me still
// lists the admin role. Every hook below answers "is this the mode they're in",
// not "do they hold this persona at all" — for the latter, and only to offer a
// switch, use useAvailablePersonas.
export function usePersonas(): SwitchablePersona[] {
  return [useActivePersona()];
}

// Whether this user can mark a register. AttendanceService._authorize_marker
// permits teachers only, deliberately and with no admin override — so an admin
// who isn't also a teacher can view attendance but never record it, and one who
// is has to be working as their teacher persona to do it.
export function useCanMarkAttendance(): boolean {
  return useActivePersona() === "teacher";
}

// Whether to offer an administrative fix at all.
//
// Several teacher screens explain a blocked state by naming the setting behind
// it — no current term, no grading system. Linking a teacher to those pages
// sends them somewhere they can't act and, until RouteAccessGuard, somewhere
// they shouldn't even see. The explanation is still worth giving; the link isn't.
//
// An owner works as the admin persona, so this covers owners too.
export function useIsSchoolAdmin(): boolean {
  return useActivePersona() === "admin";
}

// Working as the teacher persona. Distinct from useCanMarkAttendance only in
// intent: that one asks "may this person write a register", this one asks "do
// the teacher-scoped endpoints apply at all" — several endpoints
// (/subject-assignments/my-assignments among them) raise for a non-teacher
// rather than returning nothing.
export function useIsTeacher(): boolean {
  return useActivePersona() === "teacher";
}

export function useIsParent(): boolean {
  return useActivePersona() === "parent";
}

export function useIsStudent(): boolean {
  return useActivePersona() === "student";
}
