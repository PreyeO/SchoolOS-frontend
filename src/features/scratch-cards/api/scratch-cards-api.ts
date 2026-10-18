import { apiClient } from "@/lib/api/client";
import { SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type {
  CardPin,
  CardPurchase,
  RegenerateResponse,
  ScratchCard,
  ScratchCardFilters,
  StartPurchasePayload,
} from "../types";

export async function getCardPrice(): Promise<number> {
  const { data } = await apiClient.get<{ unit_price: number }>(SCRATCH_CARD_ENDPOINTS.PRICE());
  return data.unit_price;
}

export async function getCardPurchases(page: number): Promise<PaginatedResponse<CardPurchase>> {
  const { data } = await apiClient.get<PaginatedResponse<CardPurchase>>(SCRATCH_CARD_ENDPOINTS.PURCHASES(), {
    params: { page },
  });
  return data;
}

export async function startCardPurchase(payload: StartPurchasePayload): Promise<CardPurchase> {
  const { data } = await apiClient.post<CardPurchase>(SCRATCH_CARD_ENDPOINTS.PURCHASES(), payload);
  return data;
}

// Paystack's query string, passed through as-is: it sends `reference` (and
// `trxref`); the API also accepts `tx_ref`. Verifies the charge and, when paid,
// creates the cards — so it must run before the page decides what to show.
export async function confirmCardPayment(params: Record<string, string>): Promise<CardPurchase> {
  const { data } = await apiClient.get<CardPurchase>(SCRATCH_CARD_ENDPOINTS.PAYMENT_RETURN(), { params });
  return data;
}

// One-shot: the server returns the PINs once and then an empty list.
export async function revealCardPins(purchaseId: string): Promise<CardPin[]> {
  const { data } = await apiClient.get<{ cards: CardPin[] }>(SCRATCH_CARD_ENDPOINTS.REVEAL(purchaseId));
  return data.cards;
}

export async function getScratchCards(filters: ScratchCardFilters): Promise<PaginatedResponse<ScratchCard>> {
  const { data } = await apiClient.get<PaginatedResponse<ScratchCard>>(SCRATCH_CARD_ENDPOINTS.CARDS(), {
    params: filters,
  });
  return data;
}

export async function regenerateCard(id: string): Promise<RegenerateResponse> {
  const { data } = await apiClient.post<RegenerateResponse>(SCRATCH_CARD_ENDPOINTS.REGENERATE(id));
  return data;
}
