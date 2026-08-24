"use client";

import Link from "next/link";

import { useCanAccess } from "@/lib/auth/use-can-access";

// The two ways a broadsheet comes back with nothing in it — different problems
// with different fixes, so they're never collapsed into one "no data" message.
//
//   no rows    — nobody is enrolled in this arm for the selected term
//   no columns — the arm offers no subjects, so there is nothing to score

export function NoStudentsRow({ armLabel, termLabel }: { armLabel: string; termLabel: string }) {
  return (
    <p className="p-5 text-sm text-n-400 italic">
      No students are enrolled in {armLabel} for {termLabel}.
    </p>
  );
}

export function NoSubjectsRow({ armLabel }: { armLabel: string }) {
  const canManageSubjects = useCanAccess("/teaching-assignments");

  return (
    <div className="p-5">
      <p className="text-sm font-medium text-ink">{armLabel} takes no subjects yet</p>
      {/* Teaching Assignments is admin-only, so a teacher gets told what's wrong
          without being sent to a screen that would refuse them. */}
      <p className="mt-1 text-sm text-n-500">
        {canManageSubjects ? (
          <>
            Add them in{" "}
            <Link href="/teaching-assignments" className="text-primary hover:underline">
              Teaching Assignments
            </Link>{" "}
            and scores can start going in.
          </>
        ) : (
          "An administrator adds the subjects a class takes before scores can go in."
        )}
      </p>
    </div>
  );
}
