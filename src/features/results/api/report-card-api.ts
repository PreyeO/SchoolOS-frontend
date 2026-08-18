import { apiClient } from "@/lib/api/client";
import {
  CLASS_ARM_ENDPOINTS,
  CLASS_ARM_RESULT_ENDPOINTS,
  REPORT_CARD_SETTINGS_ENDPOINTS,
  STUDENT_ENDPOINTS,
} from "@/lib/api/endpoints";
import { readBlobError } from "@/lib/api/read-blob-error";
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
  try {
    const { data } = await apiClient.get<Blob>(STUDENT_ENDPOINTS.REPORT_CARD_PDF(studentId), {
      params: { academic_period_id: academicPeriodId },
      responseType: "blob",
    });
    return data;
  } catch (error) {
    // Without this the student-level refusals ("This student has no results or
    // current enrollment for this period — nothing to render") arrive as an
    // unreadable Blob and surface as a generic failure.
    throw await readBlobError(error);
  }
}

// Every currently-enrolled student in the arm, as one merged PDF or a zip of
// one PDF each. Enrollment-scoped on purpose: a student who has scores in this
// arm but has since transferred is not in the file and not in `skipped` either
// — they're simply never attempted, and staff who want their card need the
// single-student endpoint.
//
// `skipped` carries the admission numbers the backend soft-skipped, which in
// practice means "enrolled but has no results for this period". The backend
// only sets the header when the list is non-empty.
export async function getClassArmReportCards(
  classArmId: string,
  academicPeriodId: string,
  exportFormat: "pdf" | "zip",
): Promise<{ blob: Blob; skipped: string[] }> {
  let response;
  try {
    response = await apiClient.get<Blob>(CLASS_ARM_ENDPOINTS.REPORT_CARDS(classArmId), {
      params: { academic_period_id: academicPeriodId, export_format: exportFormat },
      responseType: "blob",
    });
  } catch (error) {
    // The all-failed case is a 400 whose detail ("No students with renderable
    // results found…") is the actionable part — fix enrollments or enter
    // scores. Unparsed it would read as a broken download.
    throw await readBlobError(error);
  }

  // Cross-origin, this is only readable if the backend lists it in
  // CORS_EXPOSE_HEADERS — it currently does not, so this is null in the browser
  // today and the caller degrades to not reporting skips. Harmless when it
  // lands; no frontend change needed then.
  const header = response.headers["x-skipped-students"];
  const skipped =
    typeof header === "string" && header.length > 0 ? header.split(",").filter(Boolean) : [];

  return { blob: response.data, skipped };
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
