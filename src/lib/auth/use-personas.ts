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
