"use client";

import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";

import {
  getActiveAssignment,
  getCardPrice,
  getCardPurchases,
  getScratchCards,
  getStudentCardHistory,
  type PurchaseFilters,
} from "../api/scratch-cards-api";
import type { ScratchCardFilters } from "../types";

// Every key sits under "scratch-cards", which is deliberately NOT in
// query-persistence's allowlist: nothing here is needed offline, and card
// data has no business sitting on a shared staffroom device.
export const SCRATCH_CARDS_KEY = ["scratch-cards"] as const;

// Read fresh each time the form mounts: the server snapshots the price at
// purchase time, so a stale quote would show the wrong total.
export function useCardPrice() {
  return useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "price"],
    queryFn: getCardPrice,
    staleTime: 0,
  });
}

export function useCardPurchases(filters: PurchaseFilters) {
  return useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "purchases", filters],
    queryFn: () => getCardPurchases(filters),
    placeholderData: keepPreviousData,
  });
}

// Fetched when the replace dialog opens, and always fresh: whether the card
// can be replaced at all depends on it.
export function useActiveAssignment(cardId: string | null) {
  return useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "active-assignment", cardId],
    queryFn: () => getActiveAssignment(cardId as string),
    enabled: !!cardId,
    staleTime: 0,
  });
}

// Which cards on this page can be replaced: only those with an active
// assignment, which the card row doesn't carry ("Not used yet" covers both
// untouched stock and an issued card nobody has checked a result with yet).
// One lookup per candidate, under the SAME key the replace dialog uses, so
// opening the dialog afterwards is served from cache. Callers pass only
// candidates (not replaced, not a printed slip, not the In stock view).
// Backend ask: an `active_assignment` flag on the card row would make this a
// single request instead of one per row.
export function useReplaceableCardIds(cardIds: string[]): Set<string> {
  return useQueries({
    queries: cardIds.map((id) => ({
      queryKey: [...SCRATCH_CARDS_KEY, "active-assignment", id],
      queryFn: () => getActiveAssignment(id),
      staleTime: 30_000,
    })),
    combine: (results) => new Set(cardIds.filter((_, i) => !!results[i]?.data)),
  });
}

export function useStudentCardHistory(studentId: string) {
  return useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "student-history", studentId],
    queryFn: () => getStudentCardHistory(studentId),
  });
}

export function useScratchCards(filters: ScratchCardFilters) {
  return useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "cards", filters],
    queryFn: () => getScratchCards(filters),
    placeholderData: keepPreviousData,
  });
}
