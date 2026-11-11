"use client";

import { useQuery } from "@tanstack/react-query";

import { previewIssuance } from "../api/issuance-api";
import { getScratchCards } from "../api/scratch-cards-api";
import { buildCardOverview } from "../lib/card-overview";
import { SCRATCH_CARDS_KEY } from "./use-scratch-card-queries";

// The Result Cards overview for one session: a whole-school SMS preview
// (writes nothing) turned into counts and a per-student list. A query, but a
// POST that counts against the issuance throttle (30/min per school), so it
// never refetches on focus; it refreshes on mount, after a send, and after a
// number is added (all under SCRATCH_CARDS_KEY, which those invalidate).
export function useCardOverview(sessionId: string) {
  return useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "overview", sessionId],
    queryFn: async () =>
      buildCardOverview(await previewIssuance({ scope: "school", academic_session_id: sessionId, channel: "sms" })),
    enabled: !!sessionId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

// "Parents who checked results": cards bound to a student this session (a
// card binds on its first successful result check). Only the count is read.
export function useCheckedCount(sessionId: string) {
  return useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "checked-count", sessionId],
    queryFn: async () => (await getScratchCards({ academic_session_id: sessionId, is_bound: true, page: 1 })).count,
    enabled: !!sessionId,
  });
}
