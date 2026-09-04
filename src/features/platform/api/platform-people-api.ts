import { apiClient } from "@/lib/api/client";
import {
  ADMIN_ENDPOINTS,
  PARENT_ENDPOINTS,
  STUDENT_ENDPOINTS,
  TEACHER_ENDPOINTS,
} from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { UserMinimal } from "@/lib/api/profile-summary";

// The four people directories, read cross-school by a platform admin.
//
// Each viewset returns every profile on the platform for a platform admin and
// only the caller's own school otherwise, so ?school_id= is what narrows it.
//
// NOTE — none of the four list serializers include the person's school. So a
// platform admin can ask "who is at this school" but not "which school is this
// person at", and no amount of frontend work fixes that. The screen therefore
// requires a school to be chosen rather than showing an unattributed merged
// list, which would be actively misleading.
export type PeopleKind = "students" | "teachers" | "parents" | "admins";

// The common shape across all four — each serializer nests a user and adds its
// own extras, and only these fields are shared.
export interface PlatformPerson {
  id: string;
  user: UserMinimal;
  created_at: string;
}

const ENDPOINT: Record<PeopleKind, () => string> = {
  students: STUDENT_ENDPOINTS.LIST,
  teachers: TEACHER_ENDPOINTS.LIST,
  parents: PARENT_ENDPOINTS.LIST,
  admins: ADMIN_ENDPOINTS.LIST,
};

export async function getPlatformPeople(
  kind: PeopleKind,
  schoolId: string,
  page: number,
  search?: string,
): Promise<{ people: PlatformPerson[]; total: number }> {
  const { data } = await apiClient.get<PaginatedResponse<PlatformPerson>>(ENDPOINT[kind](), {
    params: { school_id: schoolId, page, page_size: 50, ...(search ? { search } : {}) },
  });
  return { people: data.results, total: data.count };
}
