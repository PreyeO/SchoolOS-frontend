"use client";

import { SessionReviewSection } from "@/features/onboarding/components/review/session-review-section";
import { useAcademicSessions } from "../hooks/use-academic-sessions";
import { AddSessionDialog } from "./add-session-dialog";

export function SessionsPage() {
  const { data: sessions, isPending, isError } = useAcademicSessions();

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading your academic sessions…</p>;
  }

  if (isError) {
    return <p className="text-sm text-clay" role="alert">Couldn&rsquo;t load your sessions. Please refresh.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Sessions & Terms</h1>
        <p className="mt-1 text-sm text-n-500">Manage your school&rsquo;s academic sessions and their terms.</p>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-sm text-n-400 italic">No sessions yet.</p>
        ) : (
          sessions.map((session) => <SessionReviewSection key={session.id} session={session} />)
        )}
        <AddSessionDialog />
      </div>
    </div>
  );
}
