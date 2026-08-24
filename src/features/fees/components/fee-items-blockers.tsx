"use client";

import Link from "next/link";

import { useCanAccess } from "@/lib/auth/use-can-access";

interface Props {
  hasClasses: boolean;
  hasTerms: boolean;
}

// What has to exist before a fee can be written down at all. A fee item is
// pinned to a (class, term) pair, so neither can be missing — and both are set
// up somewhere else, which is the useful thing to say.
//
// Returns null once the screen is usable; the caller renders the pickers only
// when this has nothing to report.
export function FeeItemsBlockers({ hasClasses, hasTerms }: Props) {
  const canManageClasses = useCanAccess("/classes");
  const canManageSessions = useCanAccess("/settings/sessions");

  if (hasClasses && hasTerms) return null;

  return (
    <div className="space-y-2">
      {!hasClasses && (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
          Fees are set per class, and this school has no classes yet.{" "}
          {canManageClasses ? (
            <>
              Add them in{" "}
              <Link href="/classes" className="text-primary hover:underline">
                Classes &amp; Arms
              </Link>
              .
            </>
          ) : (
            "An administrator adds the school's classes."
          )}
        </p>
      )}

      {!hasTerms && (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
          Fees are charged per term, and this school has no terms yet.{" "}
          {canManageSessions ? (
            <>
              Create a session and its terms in{" "}
              <Link href="/settings/sessions" className="text-primary hover:underline">
                Sessions &amp; Terms
              </Link>
              .
            </>
          ) : (
            "An administrator sets up the academic session and its terms."
          )}
        </p>
      )}
    </div>
  );
}
