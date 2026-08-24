import { apiClient } from "@/lib/api/client";
import { STUDENT_ENDPOINTS } from "@/lib/api/endpoints";

import type { StudentLedger } from "../types";

// One student's live fee position for one term.
//
// academic_period_id is required by the backend, not defaulted — omitting it is
// a 400 ("academic_period_id query parameter is required."), so the caller must
// have resolved a term before this runs.
//
// Visibility is decided inside the service rather than by a permission string on
// the view: an admin with view_fees, any teacher, the student themself, or a
// linked parent. Anyone else gets a 403 whose detail names the ledger
// specifically ("You do not have access to this student's fee ledger.") — unlike
// the generic permission 403 the other fees endpoints return.
export async function getStudentLedger(
  studentId: string,
  academicPeriodId: string,
): Promise<StudentLedger> {
  const { data } = await apiClient.get<StudentLedger>(STUDENT_ENDPOINTS.FEES(studentId), {
    params: { academic_period_id: academicPeriodId },
  });
  return data;
}
