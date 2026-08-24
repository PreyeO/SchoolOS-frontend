import { apiClient } from "@/lib/api/client";
import { PAYMENT_ENDPOINTS } from "@/lib/api/endpoints";
import { readBlobError } from "@/lib/api/read-blob-error";
import type { PaginatedResponse } from "@/lib/api/types";

import type { Payment, RecordPaymentPayload } from "../types";

// Everything this student has ever paid, newest first (the model orders by
// -created_at). Not scoped to a term: a payment belongs to a fee item, which
// belongs to a period, and the bursar's question at the desk is usually "what
// has this family paid us", not "what did they pay in Second Term".
//
// page_size=100 with no pagination UI. A student accumulating more than 100
// payments would need one per week for two years; if that becomes real, this
// needs paging rather than a bigger page.
//
// Requires view_fees — strictly more than the ledger, which any teacher can
// read. Callers must gate on the permission rather than letting this 403.
export async function getStudentPayments(studentId: string): Promise<Payment[]> {
  const { data } = await apiClient.get<PaginatedResponse<Payment>>(PAYMENT_ENDPOINTS.LIST(), {
    params: { student: studentId, page_size: 100 },
  });
  return data.results;
}

// Records one payment against one fee item. Requires record_fees.
//
// Rejected outright (400) when the item is waived for this student, or when the
// amount exceeds what's left on that item — overpayment is never banked as
// credit. The backend locks the fee item for the transaction, so two bursars
// recording at once can't both pass a remaining-balance check that their sum
// would break. The caller still caps the input at the remaining balance, so the
// race is the only way to see that error rather than the common way.
export async function recordPayment(payload: RecordPaymentPayload): Promise<Payment> {
  const { data } = await apiClient.post<Payment>(PAYMENT_ENDPOINTS.LIST(), payload);
  return data;
}

// The printable receipt. A rendered PDF, so it needs responseType "blob" and
// readBlobError — without the latter a refusal arrives as an unreadable Blob and
// getErrorMessage falls through to "Something went wrong".
export async function getPaymentReceipt(paymentId: string): Promise<Blob> {
  try {
    const { data } = await apiClient.get<Blob>(PAYMENT_ENDPOINTS.RECEIPT(paymentId), {
      responseType: "blob",
    });
    return data;
  } catch (error) {
    throw await readBlobError(error);
  }
}
