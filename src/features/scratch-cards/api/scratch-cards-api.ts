import { apiClient } from "@/lib/api/client";
import { SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type {
  CardAssignment,
  CardPin,
  CardPurchase,
  IssuanceResult,
  PurchaseStatus,
  ReplaceCardPayload,
  ScratchCard,
  ScratchCardFilters,
  StartPurchasePayload,
} from "../types";

export async function getCardPrice(): Promise<number> {
  const { data } = await apiClient.get<{ unit_price: number }>(SCRATCH_CARD_ENDPOINTS.PRICE());
  return data.unit_price;
}

// status, academic_session_id and created_at_after/_before are server
// filters. A gateway filter exists too, unused: nobody has asked to split the
// list by provider, and each row already names its own.
export interface PurchaseFilters {
  page: number;
  status?: PurchaseStatus;
  academic_session_id?: string;
  created_at_after?: string;
  created_at_before?: string;
}

export async function getCardPurchases(filters: PurchaseFilters): Promise<PaginatedResponse<CardPurchase>> {
  const { data } = await apiClient.get<PaginatedResponse<CardPurchase>>(SCRATCH_CARD_ENDPOINTS.PURCHASES(), {
    params: filters,
  });
  return data;
}

export async function startCardPurchase(payload: StartPurchasePayload): Promise<CardPurchase> {
  const { data } = await apiClient.post<CardPurchase>(SCRATCH_CARD_ENDPOINTS.PURCHASES(), payload);
  return data;
}

// The gateway's query string, passed through as-is: Paystack sends `reference`
// (and `trxref`), Flutterwave `tx_ref` and `status`; the API reads either.
// Verifies the charge with the purchase's own gateway and, when paid,
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

export async function getScratchCard(id: string): Promise<ScratchCard> {
  const { data } = await apiClient.get<ScratchCard>(SCRATCH_CARD_ENDPOINTS.CARD(id));
  return data;
}

export async function replaceCard(id: string, payload: ReplaceCardPayload): Promise<IssuanceResult> {
  const { data } = await apiClient.post<IssuanceResult>(SCRATCH_CARD_ENDPOINTS.REPLACE(id), payload);
  return data;
}

// A student's reissue chain, newest first: every card they were given,
// including replaced ones (superseded_at set).
export async function getStudentCardHistory(studentId: string): Promise<CardAssignment[]> {
  const { data } = await apiClient.get<PaginatedResponse<CardAssignment>>(SCRATCH_CARD_ENDPOINTS.ASSIGNMENTS(), {
    params: { intended_student: studentId, page_size: 100 },
  });
  return data.results;
}

// The assignment still pointing at this serial, or null when nobody was
// issued it (e.g. an anonymous card from a purchase reveal). Filtering by card
// returns only rows on this serial, so this is a short list.
export async function getActiveAssignment(cardId: string): Promise<CardAssignment | null> {
  const { data } = await apiClient.get<PaginatedResponse<CardAssignment>>(SCRATCH_CARD_ENDPOINTS.ASSIGNMENTS(), {
    params: { card: cardId },
  });
  return data.results.find((row) => row.superseded_at === null) ?? null;
}
