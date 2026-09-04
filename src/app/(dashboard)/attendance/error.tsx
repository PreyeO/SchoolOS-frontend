"use client";

import { RouteError } from "@/components/shared/route-error";

// Scoped to this route (not the root app/error.tsx, which replaces the whole
// page including the sidebar) — see the reasoning in RouteError. Reported
// directly: opening Attendance offline, on a device that has never loaded it,
// fell through to the root boundary's generic placeholder rather than
// explaining why.
export default function AttendanceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError reset={reset} label="Attendance" />;
}
