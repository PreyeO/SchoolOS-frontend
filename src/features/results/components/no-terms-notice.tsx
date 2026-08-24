"use client";

import Link from "next/link";

import { useCanAccess } from "@/lib/auth/use-can-access";

// The screens that carry a term picker are blocked only when the school has NO
// terms at all — not merely when none is marked current, which the picker now
// handles by falling back to the newest session's first term.
//
// Distinct from NoCurrentTermNotice, which still serves score entry, behaviour
// and remarks: those write against the current term specifically and genuinely
// cannot proceed without one.
export function NoTermsNotice({ consequence }: { consequence: string }) {
  const canManageSessions = useCanAccess("/settings/sessions");

  return (
    <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
      This school has no academic terms yet, so {consequence}.{" "}
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
  );
}
