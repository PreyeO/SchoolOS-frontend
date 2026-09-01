"use client";

import { useEffect, useRef } from "react";

import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { applyAuthTokens } from "@/lib/auth/apply-auth-tokens";
import { HANDOFF_PARAMS, safeNextPath } from "@/lib/auth/handoff";
import { getSchoolDetail } from "@/lib/school/get-school-detail";
import { useAuthStore } from "@/stores/auth-store";
import { useSchoolStore } from "@/stores/school-store";

// Receives a session handed over from the apex and settles it onto this
// subdomain, then sends the visitor on.
//
// Order matters, and each step is here for a reason:
//
//  1. Read the fragment, then strip it from the URL with replaceState BEFORE
//     anything else. That entry is what would otherwise sit in history.
//  2. Store the pair, so the rotate call below is authenticated.
//  3. Rotate immediately. The backend now issues a new refresh token and
//     blacklists the old one, so the copy that travelled in the URL is dead
//     within a second of arriving — verified live ("Token is blacklisted").
//  4. Hard-navigate rather than client-route. The app booted on this page with
//     an empty auth store; a client route would carry that boot forward, and
//     anything that keyed off "no session" at startup (the persisted query
//     cache keys off membership_id) would stay wrong until a manual refresh.
//     That is exactly the "no current term" symptom from the iframe version.
//     A full load costs a moment and guarantees every store and query starts
//     with a valid session.
export function AuthHandoffView() {
  // Effects run twice in React StrictMode; rotating twice would blacklist the
  // token we just stored and log the user straight back out.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const access = params.get(HANDOFF_PARAMS.access);
    const refresh = params.get(HANDOFF_PARAMS.refresh);
    const next = safeNextPath(params.get(HANDOFF_PARAMS.next));

    // Strip first. Everything after this can fail without leaving the tokens
    // sitting in the address bar or the history entry.
    window.history.replaceState(null, "", window.location.pathname);

    if (!access || !refresh) {
      // Opened directly, or a malformed link. Nothing to settle.
      window.location.replace(useAuthStore.getState().tokens ? next : "/login");
      return;
    }

    applyAuthTokens(access, refresh);

    // Rotate the handed-over pair, and warm the school store, before moving on.
    //
    // The store is origin-scoped like everything else, so it arrives empty on
    // this subdomain. The dashboard would otherwise paint in the default
    // SchoolOS palette and repaint once the profile query landed — and an empty
    // store is what let the term race drop the current session (see
    // useSyncSchoolData). Filling it here means the dashboard boots knowing
    // which school it is.
    //
    // Both run together: neither depends on the other, and this page is already
    // showing a "signing you in" state.
    async function rotate() {
      try {
        const { data } = await apiClient.post<{ access: string; refresh?: string }>(
          ENDPOINTS.REFRESH,
          { refresh },
        );
        // Only replace when the backend actually rotated. If it ever stops
        // doing so, the pair we already stored is still valid.
        if (data.refresh) applyAuthTokens(data.access, data.refresh);
      } catch {
        // Rotation is a hardening step, not a gate. The handed-over pair works;
        // failing here must not strand someone on a blank page.
      }
    }

    async function warmSchool() {
      const schoolId = useAuthStore.getState().claims?.school_id;
      if (!schoolId) return;
      try {
        const school = await getSchoolDetail(schoolId);
        useSchoolStore.getState().hydrateSchool({
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
      } catch {
        // The dashboard re-fetches this anyway via useSyncSchoolData; warming
        // it here only removes a repaint.
      }
    }

    async function settleThenContinue() {
      await Promise.allSettled([rotate(), warmSchool()]);
      window.location.replace(next);
    }

    void settleThenContinue();
  }, []);

  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <p className="text-sm text-n-500" role="status">
        Signing you in…
      </p>
    </div>
  );
}
