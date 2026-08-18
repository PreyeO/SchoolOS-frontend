"use client";

import Link from "next/link";

import { useIsSchoolAdmin } from "@/lib/auth/use-personas";

// Every results screen is scoped to the current term, so none of them can do
// anything until one is marked. All six said so in their own words with their
// own copy of the admin/non-admin branch; this keeps the one thing that
// actually differs — what specifically can't happen — as the caller's line.
//
// The fix is admin-only, so a teacher is told what's wrong without being
// pointed at a door that won't open for them.
export function NoCurrentTermNotice({ consequence }: { consequence: string }) {
  const isAdmin = useIsSchoolAdmin();

  return (
    <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
      No term is marked current, so {consequence}.{" "}
      {isAdmin ? (
        <>
          Set one in{" "}
          <Link href="/settings/sessions" className="text-primary hover:underline">
            Sessions &amp; Terms
          </Link>
          .
        </>
      ) : (
        "Ask an administrator to mark the current term."
      )}
    </p>
  );
}
