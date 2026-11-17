import { apiClient } from "@/lib/api/client";
import { RESULT_CHECK_ENDPOINTS } from "@/lib/api/endpoints";
import { readBlobError } from "@/lib/api/read-blob-error";
import type { ReportCard } from "@/features/results/types";

import type { CheckPeriods, CheckResultPayload } from "../types";

// All three are public: no login, and client.ts keeps any stored token off
// them (a stale one would 401 an AllowAny route).

// GET is fine here: the serial is printed on the card. The PIN never goes in
// a URL — only the POSTs below carry it.
export async function getCheckPeriods(serial: string): Promise<CheckPeriods> {
  const { data } = await apiClient.get<CheckPeriods>(RESULT_CHECK_ENDPOINTS.PERIODS(), { params: { serial } });
  return data;
}

export async function checkResult(payload: CheckResultPayload): Promise<ReportCard> {
  const { data } = await apiClient.post<ReportCard>(RESULT_CHECK_ENDPOINTS.VERIFY(), payload);
  return data;
}

// The school's own report-card template (fonts, colours, logo), the same HTML
// the PDF is made from. Shown in a sandboxed iframe via srcDoc.
export async function checkResultPreview(payload: CheckResultPayload): Promise<string> {
  const { data } = await apiClient.post<string>(RESULT_CHECK_ENDPOINTS.VERIFY_PREVIEW(), payload, {
    responseType: "text",
  });
  return data;
}

// A refusal on a blob request arrives as an unreadable Blob; readBlobError
// parses it back so getErrorMessage shows the server's own words.
export async function checkResultPdf(payload: CheckResultPayload): Promise<Blob> {
  try {
    const { data } = await apiClient.post<Blob>(RESULT_CHECK_ENDPOINTS.VERIFY_PDF(), payload, {
      responseType: "blob",
    });
    return data;
  } catch (error) {
    throw await readBlobError(error);
  }
}
