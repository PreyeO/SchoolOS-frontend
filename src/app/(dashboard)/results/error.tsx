"use client";

import { RouteError } from "@/components/shared/route-error";

// Scoped to this route — see the reasoning in RouteError and the matching
// attendance/error.tsx. Reported alongside it: Score Entry going blank offline
// on a device that had loaded it before, only recovering on a manual refresh —
// consistent with a crash on a soft client-side navigation that a hard reload
// (a genuinely different request) doesn't hit the same way. This is the safety
// net for that: if it happens again, it now explains itself instead of
// clearing the screen with nothing on it.
export default function ScoreEntryError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError reset={reset} label="Score entry" />;
}
