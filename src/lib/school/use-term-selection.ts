"use client";

import { useMemo, useState } from "react";

import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";

import { buildPeriodOptions, currentPeriodId, periodLabel, type PeriodOptionGroup } from "./period-options";

export interface TermSelection {
  groups: PeriodOptionGroup[];
  // Never null once `hasTerms` is true — falls back to the current term, then to
  // the first term of the newest session.
  periodId: string | null;
  setPeriodId: (id: string) => void;
  // "First Term · 2025/2026", or null before anything resolves.
  label: string | null;
  // Whether the selected term is the one the school is actually running. Screens
  // use it to say so when the user has navigated away from it.
  isViewingCurrentTerm: boolean;
  hasTerms: boolean;
  isPending: boolean;
  isPaused: boolean;
}

// "Which term am I looking at" — defaulted to the current one, but changeable.
//
// Every screen that reads results or fees needs exactly this, and seven of them
// were deriving it inline from the same three helpers. One hook so the fallback
// chain can't drift between screens.
//
// Note this is for READING. Score entry deliberately has no term picker: a score
// always belongs to the term that is current, and back-dating one is a
// correction that belongs to the unlock workflow rather than routine entry (see
// use-score-sheets). Reviewing, publishing and ranking a *past* term are all
// legitimate, which is why those screens get a picker and entry doesn't.
export function useTermSelection(): TermSelection {
  const { data: sessions, isPending, isPaused } = useAcademicSessions();
  const [chosen, setChosen] = useState<string | null>(null);

  const groups = useMemo(() => buildPeriodOptions(sessions ?? []), [sessions]);

  const current = currentPeriodId(sessions ?? []);
  const periodId = chosen ?? current ?? groups[0]?.options[0]?.periodId ?? null;

  return {
    groups,
    periodId,
    setPeriodId: setChosen,
    label: periodLabel(sessions ?? [], periodId),
    // False when no term is marked current at all — the school hasn't told us
    // which one it's on, so nothing can claim to be it.
    isViewingCurrentTerm: !!current && periodId === current,
    hasTerms: groups.length > 0,
    isPending,
    isPaused,
  };
}
