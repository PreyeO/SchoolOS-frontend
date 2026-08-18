import { apiClient } from "@/lib/api/client";
import { CLASS_ARM_ENDPOINTS, STUDENT_ENDPOINTS } from "@/lib/api/endpoints";
import { readBlobError } from "@/lib/api/read-blob-error";

// The binary report-card surfaces, kept apart from the JSON ones: they all need
// responseType "blob", and all need readBlobError to make a rejection legible.

// Can't be a plain <a href>: the endpoint is bearer-token authenticated and an
// anchor sends cookies, not an Authorization header.
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
    // Without this, student-level refusals ("no results or current enrollment
    // for this period — nothing to render") arrive as an unreadable Blob and
    // surface as a generic failure.
    throw await readBlobError(error);
  }
}

// Every currently-enrolled student in the arm, as one merged PDF or a zip of
// one PDF each. Enrollment-scoped on purpose: a student with scores here who
// has since transferred is neither in the file nor in `skipped` — they're never
// attempted, and staff wanting their card need the single-student endpoint.
//
// `skipped` carries admission numbers the backend soft-skipped, which in
// practice means "enrolled but no results this period". The header is only set
// when that list is non-empty.
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
    // results found…") is the actionable part. Unparsed it reads as a broken
    // download rather than a fixable empty state.
    throw await readBlobError(error);
  }

  // Cross-origin, this is only readable if the backend lists it in
  // CORS_EXPOSE_HEADERS — it currently does not, so this is empty in the
  // browser today and the caller simply reports no skips. No change needed
  // here when that lands.
  const header = response.headers["x-skipped-students"];
  const skipped =
    typeof header === "string" && header.length > 0 ? header.split(",").filter(Boolean) : [];

  return { blob: response.data, skipped };
}
