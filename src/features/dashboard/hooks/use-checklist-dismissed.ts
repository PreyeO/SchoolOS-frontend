"use client";

import { useState } from "react";

function storageKey(schoolId: string): string {
  return `schoolos-checklist-dismissed:${schoolId}`;
}

// Read directly during render rather than in an effect — safe here because
// this only ever mounts under AuthGuard, which withholds the whole dashboard
// tree (renders null) until past hydration, so there's no SSR/client HTML to
// mismatch against.
function readDismissed(schoolId: string | undefined): boolean {
  if (!schoolId || typeof window === "undefined") return false;
  return localStorage.getItem(storageKey(schoolId)) === "1";
}

// Scoped per school (not just a bare flag) so switching schools — or a new
// school reusing the same browser — doesn't inherit a stale dismissal.
export function useChecklistDismissed(schoolId: string | undefined) {
  const [override, setOverride] = useState<boolean | null>(null);
  const dismissed = override ?? readDismissed(schoolId);

  function dismiss() {
    if (!schoolId) return;
    localStorage.setItem(storageKey(schoolId), "1");
    setOverride(true);
  }

  return { dismissed, dismiss };
}
