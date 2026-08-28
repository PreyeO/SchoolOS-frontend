import type { ReactNode } from "react";

import { NotEnrolledNotice } from "./not-enrolled-notice";

// Every /my/* screen needs the caller's own StudentProfile id, and that id is
// derived from their class roster — so "still resolving" and "not in a class"
// are the two states each screen shares before it can fetch anything.
//
// A plain function, not a hook: it calls none, so it can run after an early
// return without breaking the rules of hooks. Mirrors childScreenGuard.
//
// Returns null once an id resolved and the screen should render normally.
export function studentScreenGuard(
  studentId: string | undefined,
  isPending: boolean,
): ReactNode | null {
  if (isPending) {
    return (
      <p className="text-sm text-n-400" role="status">
        Loading…
      </p>
    );
  }
  if (!studentId) {
    return <NotEnrolledNotice />;
  }
  return null;
}
