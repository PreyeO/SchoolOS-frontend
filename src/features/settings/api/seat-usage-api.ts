import { apiClient } from "@/lib/api/client";
import { STUDENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

export interface SeatUsage {
  active: number;
  suspended: number;
}

// How many seats of student_capacity are taken. The backend's own number
// (UserService._get_student_count) isn't exposed to schools — only on the
// platform financials route — so it's rebuilt from the directory: the same
// school-scoped StudentProfile set, counted for exactly the two statuses
// capacity counts (active + suspended). Students who have left (graduated,
// transferred, withdrawn, expelled) free their seat and are excluded.
//
// page_size=1: only `count` is read. No is_active filter, because the
// backend's count has none either.
//
// Gated like the directory: an admin with view_students, or a teacher.
export async function getSeatUsage(): Promise<SeatUsage> {
  const count = async (status: "active" | "suspended") => {
    const { data } = await apiClient.get<PaginatedResponse<unknown>>(STUDENT_ENDPOINTS.LIST(), {
      params: { enrollment_status: status, page_size: 1 },
    });
    return data.count;
  };
  const [active, suspended] = await Promise.all([count("active"), count("suspended")]);
  return { active, suspended };
}
