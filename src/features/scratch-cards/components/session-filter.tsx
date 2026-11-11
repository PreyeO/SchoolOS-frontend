"use client";

import { useState } from "react";

import { Select } from "@/components/ui/select";
import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";
import { useSchoolStore } from "@/stores/school-store";

export const ALL_SESSIONS = "all";

// Cards, purchases and sends all belong to one academic session, and issuance
// works one session at a time. Starts on the current session (or the newest,
// if none is current), with "All sessions" as an option unless `allowAll` is
// false (the overview needs one real session). Returns the chosen id ("" for
// all, or while sessions load), its name, and the control to render.
export function useSessionFilter(idPrefix: string, { allowAll = true }: { allowAll?: boolean } = {}) {
  const { data: sessions = [], isPending } = useAcademicSessions();
  const currentName = useSchoolStore((s) => s.currentSchool?.sessionName);
  const fallback = sessions.find((s) => s.name === currentName)?.id ?? sessions[0]?.id ?? (allowAll ? ALL_SESSIONS : "");
  const [picked, setPicked] = useState<string | null>(null);
  const value = picked ?? fallback;
  const sessionName = sessions.find((s) => s.id === value)?.name ?? "";

  const control = (onChange?: () => void) => (
    <Select
      aria-label="Session"
      id={`${idPrefix}-session`}
      value={value}
      onChange={(e) => { setPicked(e.target.value); onChange?.(); }}
      className="h-9 w-full sm:w-44"
    >
      {allowAll && <option value={ALL_SESSIONS}>All sessions</option>}
      {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </Select>
  );

  return {
    sessionId: value === ALL_SESSIONS ? "" : value,
    sessionName,
    isAll: value === ALL_SESSIONS,
    hasSessions: sessions.length > 0,
    sessionsLoading: isPending,
    control,
  };
}
