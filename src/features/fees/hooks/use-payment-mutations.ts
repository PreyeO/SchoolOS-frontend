"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { saveBlob } from "@/lib/api/save-blob";

import { getPaymentReceipt, recordPayment } from "../api/payments-api";
import { createWaiver, deleteWaiver } from "../api/waivers-api";
import { useFeesMutation } from "./use-fees-mutation";
import type { CreateWaiverPayload, RecordPaymentPayload } from "../types";

// Names the receipt number in the toast because that's what the bursar writes
// down or reads back to the parent standing there — and it's the only place it
// appears before the history list refetches.
export function useRecordPayment() {
  return useFeesMutation(
    (payload: RecordPaymentPayload) => recordPayment(payload),
    (payment) => `Payment recorded · ${payment.receipt_number}`,
  );
}

export function useCreateWaiver() {
  return useFeesMutation(
    (payload: CreateWaiverPayload) => createWaiver(payload),
    (waiver) => `${waiver.fee_item_name} waived`,
  );
}

export function useRemoveWaiver() {
  return useFeesMutation(
    ({ id }: { id: string; feeName: string }) => deleteWaiver(id),
    (_result, { feeName }) => `${feeName} is billable again`,
  );
}

// A download, not a query — the bytes are fetched on click and handed straight
// to the browser, never cached. Uses a plain useMutation rather than
// useFeesMutation: nothing changed server-side, so invalidating the fees tree
// would refetch the ledger for no reason, and there's no success toast worth
// showing when the file lands in the downloads tray.
export function useDownloadReceipt() {
  return useMutation({
    mutationFn: async ({ paymentId, receiptNumber }: { paymentId: string; receiptNumber: string }) => {
      const blob = await getPaymentReceipt(paymentId);
      // Matches the server's own Content-Disposition filename, which isn't
      // readable cross-origin without CORS_EXPOSE_HEADERS.
      saveBlob(blob, `${receiptNumber}.pdf`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
