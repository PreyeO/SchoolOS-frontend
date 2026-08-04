"use client";

import { ErrorState } from "@/components/shared/error-state";

import { useAcademicSessions } from "../hooks/use-academic-sessions";
import { AddSessionDialog } from "./add-session-dialog";
import { SessionCard } from "./sessions/session-card";

export function SessionsPage() {
  const { data: sessions, isPending, isError, error } = useAcademicSessions();

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading your academic sessions…</p>;
  }

  if (isError || !sessions) {
    return <ErrorState error={error} resourceLabel="your sessions" />;
  }

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Sessions & Terms</h1>
          <p className="mt-1 text-sm text-n-500">Manage your school&rsquo;s academic sessions and their terms.</p>
        </div>
        <AddSessionDialog />
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-n-400 italic">No sessions yet.</p>
      ) : (
        <div className="space-y-4">
          {sorted.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
