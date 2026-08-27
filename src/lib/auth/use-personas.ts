"use client";

import { useAuthStore } from "@/stores/auth-store";

// Personas the JWT carries for the current school membership. accounts/tokens.py
// emits any of 'admin', 'owner', 'teacher', 'parent', 'student' — they're not
// exclusive, so one person can be both an admin and a teacher.
export function usePersonas(): string[] {
  return useAuthStore((s) => s.claims?.personas) ?? [];
}

// Whether this user can mark a register. AttendanceService._authorize_marker
// permits teachers only, deliberately and with no admin override — so an admin
// who isn't also a teacher can view attendance but never record it.
export function useCanMarkAttendance(): boolean {
  return usePersonas().includes("teacher");
}

// Whether to offer an administrative fix at all.
//
// Several teacher screens explain a blocked state by naming the setting behind
// it — no current term, no grading system. Linking a teacher to those pages
// sends them somewhere they can't act and, until RouteAccessGuard, somewhere
// they shouldn't even see. The explanation is still worth giving; the link isn't.
//
// "owner" always travels with "admin" in the token, so testing for admin alone
// covers both.
export function useIsSchoolAdmin(): boolean {
  return usePersonas().includes("admin");
}

// Holds a teacher profile at this school. Distinct from useCanMarkAttendance
// only in intent: that one asks "may this person write a register", this one
// asks "do the teacher-scoped endpoints apply at all" — several endpoints
// (/subject-assignments/my-assignments among them) raise for a non-teacher
// rather than returning nothing.
export function useIsTeacher(): boolean {
  return usePersonas().includes("teacher");
}

export function useIsParent(): boolean {
  return usePersonas().includes("parent");
}

export function useIsStudent(): boolean {
  return usePersonas().includes("student");
}
