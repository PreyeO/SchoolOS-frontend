"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

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
