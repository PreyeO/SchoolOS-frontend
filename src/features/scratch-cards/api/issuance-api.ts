import { apiClient } from "@/lib/api/client";
import { SCRATCH_CARD_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type {
  IssuanceBatch,
  IssuanceChannel,
  IssuanceCommitPayload,
  IssuancePreview,
  IssuancePreviewPayload,
  IssuanceResult,
  MessageStatus,
  OutboundMessage,
  ResolvePayload,
  ResolveResult,
} from "../types";

export async function previewIssuance(payload: IssuancePreviewPayload): Promise<IssuancePreview> {
  const { data } = await apiClient.post<IssuancePreview>(SCRATCH_CARD_ENDPOINTS.ISSUE_PREVIEW(), payload);
  return data;
}

export async function commitIssuance(payload: IssuanceCommitPayload): Promise<IssuanceResult> {
  const { data } = await apiClient.post<IssuanceResult>(SCRATCH_CARD_ENDPOINTS.ISSUE_COMMIT(), payload);
  return data;
}

// Note the param is `academic_session` here (filterset_fields), not the
// `academic_session_id` the card and purchase lists take.
export interface BatchFilters {
  page: number;
  channel?: IssuanceChannel;
  academic_session?: string;
}

export async function getIssuanceBatches(filters: BatchFilters): Promise<PaginatedResponse<IssuanceBatch>> {
  const { data } = await apiClient.get<PaginatedResponse<IssuanceBatch>>(SCRATCH_CARD_ENDPOINTS.BATCHES(), {
    params: filters,
  });
  return data;
}

export async function getIssuanceBatch(id: string): Promise<IssuanceBatch> {
  const { data } = await apiClient.get<IssuanceBatch>(SCRATCH_CARD_ENDPOINTS.BATCH(id));
  return data;
}

export async function getOutboundMessages(status: MessageStatus): Promise<PaginatedResponse<OutboundMessage>> {
  const { data } = await apiClient.get<PaginatedResponse<OutboundMessage>>(SCRATCH_CARD_ENDPOINTS.MESSAGES(), {
    params: { status, purpose: "scratch_card_pin" },
  });
  return data;
}

export async function resolveMessage(payload: ResolvePayload): Promise<ResolveResult> {
  const { data } = await apiClient.post<ResolveResult>(SCRATCH_CARD_ENDPOINTS.RESOLVE(), payload);
  return data;
}
