"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { WALLET_KEY } from "@/features/wallet/hooks/use-wallet-queries";

import {
  commitIssuance,
  getIssuanceBatch,
  getIssuanceBatches,
  getOutboundMessages,
  previewIssuance,
  resolveMessage,
  type BatchFilters,
} from "../api/issuance-api";
import type { IssuanceBatch, MessageStatus } from "../types";
import { SCRATCH_CARDS_KEY } from "./use-scratch-card-queries";

// A mutation, not a query: it's a POST, throttled per school, and must run
// only when the admin asks (never on every change of a picker).
export function usePreviewIssuance() {
  return useMutation({
    mutationFn: previewIssuance,
    networkMode: "always",
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// Print returns PINs: never paused (a paused mutation is persisted with its
// result), and dropped from the cache once unobserved. Errors are the
// caller's, because a 409 needs its own explanation.
export function useCommitIssuance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commitIssuance,
    networkMode: "always",
    gcTime: 0,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SCRATCH_CARDS_KEY });
      queryClient.invalidateQueries({ queryKey: WALLET_KEY });
    },
  });
}

export function useIssuanceBatches(filters: BatchFilters) {
  return useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "batches", filters],
    queryFn: () => getIssuanceBatches(filters),
    placeholderData: keepPreviousData,
  });
}

const IN_FLIGHT: (MessageStatus | null)[] = ["pending", "sending"];
export const BATCH_POLL_MS = 5000;

export function batchInFlight(batch: IssuanceBatch | undefined): boolean {
  return !!batch?.assignments?.some((a) => IN_FLIGHT.includes(a.message_status));
}

// Polls the DETAIL (the list has no per-recipient status) while any text is
// still pending or sending, and stops once every one has an outcome.
export function useIssuanceBatch(id: string) {
  return useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "batch", id],
    queryFn: () => getIssuanceBatch(id),
    refetchInterval: (query) => (batchInFlight(query.state.data) ? BATCH_POLL_MS : false),
  });
}

export function useOutboundMessages(status: MessageStatus) {
  return useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "messages", status],
    queryFn: () => getOutboundMessages(status),
  });
}

export function useResolveMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveMessage,
    networkMode: "always",
    onSuccess: (result) => {
      toast.success(result.batch ? "Sending again." : "Marked failed. Its credits are back in the wallet.");
      queryClient.invalidateQueries({ queryKey: SCRATCH_CARDS_KEY });
      queryClient.invalidateQueries({ queryKey: WALLET_KEY });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
