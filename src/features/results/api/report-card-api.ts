import { apiClient } from "@/lib/api/client";
import {
  CLASS_ARM_RESULT_ENDPOINTS,
  REPORT_CARD_SETTINGS_ENDPOINTS,
  STUDENT_ENDPOINTS,
} from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type {
  ClassArmResult,
  ReportCard,
  ReportCardOptions,
  ReportCardSettings,
} from "../types";

export async function getReportCard(
  studentId: string,
  academicPeriodId: string,
): Promise<ReportCard> {
  const { data } = await apiClient.get<ReportCard>(STUDENT_ENDPOINTS.REPORT_CARD(studentId), {
    params: { academic_period_id: academicPeriodId },
  });
  return data;
}

// Raw HTML for an iframe. Fetched through apiClient rather than pointed at with
// a bare src, because the endpoint needs the Authorization header — an iframe
// src carries cookies, and this API is bearer-token only.
export async function getReportCardPreview(
  studentId: string,
  academicPeriodId: string,
): Promise<string> {
  const { data } = await apiClient.get<string>(STUDENT_ENDPOINTS.REPORT_CARD_PREVIEW(studentId), {
    params: { academic_period_id: academicPeriodId },
    responseType: "text",
  });
  return data;
}

// Same reason as the preview: the download can't be a plain link, because the
// request must carry the bearer token. Comes back as a binary blob, which the
// caller turns into a save.
export async function getReportCardPdf(
  studentId: string,
  academicPeriodId: string,
): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(STUDENT_ENDPOINTS.REPORT_CARD_PDF(studentId), {
    params: { academic_period_id: academicPeriodId },
    responseType: "blob",
  });
  return data;
}

export async function getClassArmResults(academicPeriodId: string): Promise<ClassArmResult[]> {
  const { data } = await apiClient.get<PaginatedResponse<ClassArmResult>>(
    CLASS_ARM_RESULT_ENDPOINTS.LIST(),
    { params: { academic_period: academicPeriodId, page_size: 100 } },
  );
  return data.results;
}

// Resolves or creates the broadsheet row and locks it in one call, so there's no
// pk to look up first. Refused until every subject the arm offers has an
// APPROVED submission — the error names which are still outstanding.
export async function lockClassArmResult(
  classArmId: string,
  academicPeriodId: string,
): Promise<ClassArmResult> {
  const { data } = await apiClient.post<ClassArmResult>(CLASS_ARM_RESULT_ENDPOINTS.LOCK(), {
    class_arm_id: classArmId,
    academic_period_id: academicPeriodId,
  });
  return data;
}

export async function unlockClassArmResult(
  classArmId: string,
  academicPeriodId: string,
  reason: string,
): Promise<ClassArmResult> {
  const { data } = await apiClient.post<ClassArmResult>(CLASS_ARM_RESULT_ENDPOINTS.UNLOCK(), {
    class_arm_id: classArmId,
    academic_period_id: academicPeriodId,
    reason,
  });
  return data;
}

// Lazily created server-side on first read, so this never 404s for a valid level.
export async function getReportCardSettings(level: string): Promise<ReportCardSettings> {
  const { data } = await apiClient.get<ReportCardSettings>(
    REPORT_CARD_SETTINGS_ENDPOINTS.DETAIL(level),
  );
  return data;
}

export async function updateReportCardSettings(
  level: string,
  payload: Partial<Omit<ReportCardSettings, "id" | "level" | "updated_at">>,
): Promise<ReportCardSettings> {
  const { data } = await apiClient.patch<ReportCardSettings>(
    REPORT_CARD_SETTINGS_ENDPOINTS.DETAIL(level),
    payload,
  );
  return data;
}

// Fixed enum choices for the settings pickers. School-independent, so it's
// cached indefinitely by the hook rather than refetched per level.
export async function getReportCardOptions(): Promise<ReportCardOptions> {
  const { data } = await apiClient.get<ReportCardOptions>(REPORT_CARD_SETTINGS_ENDPOINTS.OPTIONS());
  return data;
}
