import { apiClient } from "@/lib/api/client";
import { REMARK_ENDPOINTS, TRAIT_ENDPOINTS, TRAIT_RATING_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type {
  BehavioralTrait,
  BulkTraitRatingPayload,
  BulkTraitRatingResponse,
  CreateTraitsPayload,
  SetRemarkPayload,
  StudentResultRemark,
  StudentTraitRating,
} from "../types";

// School-wide trait config. page_size=100 covers both categories across every
// level with room to spare — a school defines a handful per heading.
export async function getTraits(): Promise<BehavioralTrait[]> {
  const { data } = await apiClient.get<PaginatedResponse<BehavioralTrait>>(TRAIT_ENDPOINTS.LIST(), {
    params: { page_size: 100 },
  });
  return data.results;
}

// Creates several traits for one (level, category) in a single call.
export async function createTraits(payload: CreateTraitsPayload): Promise<BehavioralTrait[]> {
  const { data } = await apiClient.post<BehavioralTrait[]>(TRAIT_ENDPOINTS.LIST(), payload);
  return data;
}

export async function updateTrait(
  id: string,
  payload: { name?: string; order?: number },
): Promise<BehavioralTrait> {
  const { data } = await apiClient.patch<BehavioralTrait>(TRAIT_ENDPOINTS.DETAIL(id), payload);
  return data;
}

// Deletes outright, or deactivates if ratings already reference it — the backend
// decides which, so a 204 doesn't necessarily mean the row is gone.
export async function deleteTrait(id: string): Promise<void> {
  await apiClient.delete(TRAIT_ENDPOINTS.DETAIL(id));
}

// Every rating for one arm in one term, across all traits. Filter keys are the
// bare FK names — filterset_fields, like the submissions list.
export async function getTraitRatings(
  classArmId: string,
  academicPeriodId: string,
): Promise<{ ratings: StudentTraitRating[]; total: number }> {
  const { data } = await apiClient.get<PaginatedResponse<StudentTraitRating>>(
    TRAIT_RATING_ENDPOINTS.LIST(),
    { params: { class_arm: classArmId, academic_period: academicPeriodId, page_size: 100 } },
  );
  return { ratings: data.results, total: data.count };
}

// Upserts on (student, trait, academic_period). Same replay guarantees as score
// entry: a partial payload is safe, and marked_at settles conflicts.
export async function bulkRateStudents(
  payload: BulkTraitRatingPayload,
): Promise<BulkTraitRatingResponse> {
  const { data } = await apiClient.post<BulkTraitRatingResponse>(
    TRAIT_RATING_ENDPOINTS.BULK_RATE(),
    payload,
  );
  return data;
}

export async function getRemarks(
  classArmId: string,
  academicPeriodId: string,
): Promise<StudentResultRemark[]> {
  const { data } = await apiClient.get<PaginatedResponse<StudentResultRemark>>(
    REMARK_ENDPOINTS.LIST(),
    { params: { class_arm: classArmId, academic_period: academicPeriodId, page_size: 100 } },
  );
  return data.results;
}

// Identity-gated in the service: only the arm's form teacher may write this one.
export async function setClassTeacherRemark(
  payload: SetRemarkPayload,
): Promise<StudentResultRemark> {
  const { data } = await apiClient.post<StudentResultRemark>(
    REMARK_ENDPOINTS.CLASS_TEACHER(),
    payload,
  );
  return data;
}

// Permission-gated instead: requires manage_remarks.
export async function setPrincipalRemark(
  payload: SetRemarkPayload,
): Promise<StudentResultRemark> {
  const { data } = await apiClient.post<StudentResultRemark>(REMARK_ENDPOINTS.PRINCIPAL(), payload);
  return data;
}
