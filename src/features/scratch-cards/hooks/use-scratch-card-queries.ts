"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getCardPrice, getCardPurchases, getScratchCards } from "../api/scratch-cards-api";
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

export function useCardPurchases(page: number) {
  return useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "purchases", page],
    queryFn: () => getCardPurchases(page),
    placeholderData: keepPreviousData,
  });
}

export function useScratchCards(filters: ScratchCardFilters) {
  return useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "cards", filters],
    queryFn: () => getScratchCards(filters),
    placeholderData: keepPreviousData,
  });
}
