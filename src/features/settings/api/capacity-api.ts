import { apiClient } from "@/lib/api/client";
import { SCHOOL_ENDPOINTS } from "@/lib/api/endpoints";
import type { SchoolDetailResponse } from "@/lib/school/get-school-detail";

// The billing paper trail for a mid-subscription capacity increase
// (CapacityAdjustmentSerializer). Informational only — nothing is charged
// through it, since there's no gateway; it's what the school gets invoiced
// from manually. Null on the response when the change was a decrease, a
// no-op, or made during trial.
export interface CapacityAdjustment {
  id: string;
  previous_capacity: number;
  new_capacity: number;
  students_added: number;
  prorated_amount: number;
  days_remaining: number;
  created_at: string;
}

export interface UpdateCapacityResponse {
  school: SchoolDetailResponse;
  capacity_adjustment: CapacityAdjustment | null;
}

// 400s if new_capacity is below the school's current ACTIVE student headcount
// ("Cannot set capacity below the current student count (N)."), which is the
// error worth surfacing verbatim — it names the number they have to clear.
export async function updateStudentCapacity(
  schoolId: string,
  studentCapacity: number,
): Promise<UpdateCapacityResponse> {
  const { data } = await apiClient.post<UpdateCapacityResponse>(
    SCHOOL_ENDPOINTS.UPDATE_CAPACITY(schoolId),
    { student_capacity: studentCapacity },
  );
  return data;
}
