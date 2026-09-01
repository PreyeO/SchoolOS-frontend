"use client";

import { useEffect } from "react";

import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";
import { useSchoolProfile } from "@/features/settings/hooks/use-school-profile";
import { useSchoolStore } from "@/stores/school-store";

// currentSchool is only ever written at login/verify-otp/create-school time,
// or by the browser tab that made an edit — a DIFFERENT already-logged-in
// user (or the same admin in a second tab) keeps whatever was true when their
// session started until they log out and back in, even across a refresh.
// Mounting these two queries here refetches them (TanStack's default: on
// mount, and again on window refocus) and syncs the result back into the
// store, so the shell's colors and the current-term chip catch up without
// requiring a fresh login.
export function useSyncSchoolData() {
  const { data: school } = useSchoolProfile();
  const { data: sessions } = useAcademicSessions();
  const hydrateSchool = useSchoolStore((s) => s.hydrateSchool);
  const updateSession = useSchoolStore((s) => s.updateSession);
  // updateSession is a no-op while currentSchool is null — it merges into an
  // existing school rather than creating one. On a fresh origin the store
  // starts empty and these two queries race, so whenever sessions landed first
  // the term was silently dropped and the effect never re-ran. That is what
  // left the chip reading "no current term" after a subdomain hand-off until a
  // manual refresh, where the store was already populated and the order no
  // longer mattered. Waiting for the school, and re-running once it arrives,
  // makes the order irrelevant.
  const hasSchool = useSchoolStore((s) => s.currentSchool !== null);

  useEffect(() => {
    if (!school) return;
    hydrateSchool({
      id: school.id,
      name: school.name,
      slug: school.slug,
      school_type: school.school_type,
      levels: school.levels,
      primaryColor: school.primary_color,
      accentColor: school.accent_color,
      logoUrl: school.logo,
      motto: school.motto,
    });
  }, [school, hydrateSchool]);

  useEffect(() => {
    if (!sessions || !hasSchool) return;
    const current = sessions
      .flatMap((s) => s.periods.map((p) => ({ sessionName: s.name, period: p })))
      .find((entry) => entry.period.is_current);
    // Clear when nothing is current, rather than leaving the last known term in
    // place. A school between terms genuinely has no current session, and every
    // enrollment path (invite-student, enroll) hard-fails until one is set — so
    // the chip showing a stale term would hide the actual cause of those errors.
    updateSession(current?.sessionName ?? null, current?.period.name ?? null);
  }, [sessions, hasSchool, updateSession]);
}
