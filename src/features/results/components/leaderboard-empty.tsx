"use client";

import Link from "next/link";

import { useCanAccess } from "@/lib/auth/use-can-access";

// Why a leaderboard is empty, which differs entirely by mode.
//
// Overall reads StudentResultSummary, which is only written when a broadsheet is
// locked — so it's empty until results are published, and the way out is to
// publish. By-subject reads StudentSubjectResult, which exists as soon as scores
// are entered, so an empty one really does mean nobody has entered anything.
export function LeaderboardEmpty({
  mode,
  armLabel,
}: {
  mode: "overall" | "subject";
  armLabel: string | null;
}) {
  const canPublish = useCanAccess("/results/publish");

  if (mode === "subject") {
    return (
      <p className="p-5 text-sm text-n-500">
        No scores have been entered for this subject in this term yet.
      </p>
    );
  }

  return (
    <p className="p-5 text-sm text-n-500">
      Overall positions are computed when a class is published, so there&rsquo;s nothing to
      rank yet.{" "}
      {/* Publish Results is admin-only. A teacher is pointed at By subject
          instead, which they can actually use — it reads entered scores rather
          than the lock. */}
      {canPublish ? (
        <>
          Publish {armLabel ?? "this class"} in{" "}
          <Link href="/results/publish" className="text-primary hover:underline">
            Publish Results
          </Link>
          , or switch to <em>By subject</em>, which works from entered scores.
        </>
      ) : (
        <>
          Switch to <em>By subject</em>, which works from entered scores — or ask an
          administrator to publish the class.
        </>
      )}
    </p>
  );
}
