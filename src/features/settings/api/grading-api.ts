import { apiClient } from "@/lib/api/client";
import { GRADING_SYSTEM_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { SchoolLevelValue } from "@/data/school-levels";

export interface GradeComponent {
  id: string;
  name: string;
  max_obtainable: number;
  order: number;
}

export interface GradeRange {
  id: string;
  grade: string;
  min_score: number;
  max_score: number;
  remark: string | null;
}

export interface GradingSystem {
  id: string;
  level: SchoolLevelValue;
  name: string | null;
  components: GradeComponent[];
  ranges: GradeRange[];
  created_at: string;
}

export interface GradeComponentInput {
  name: string;
  max_obtainable: number;
  order: number;
}

export interface GradeRangeInput {
  grade: string;
  min_score: number;
  max_score: number;
  remark: string;
}

export interface CreateGradingSystemPayload {
  level: SchoolLevelValue;
  name?: string;
  components: GradeComponentInput[];
  ranges: GradeRangeInput[];
}

// Confirmed against academic/serializers.py GradingSystemUpdateSerializer —
// components/ranges, if provided, WHOLLY replace the existing set (deleted and
// recreated, not merged); level is not editable post-creation at all.
export interface UpdateGradingSystemPayload {
  name?: string;
  components?: GradeComponentInput[];
  ranges?: GradeRangeInput[];
}

// A school has at most one grading system per level (5 levels max), so the
// default page size always covers it — no pagination UI needed.
export async function getGradingSystems(): Promise<GradingSystem[]> {
  const { data } = await apiClient.get<PaginatedResponse<GradingSystem>>(GRADING_SYSTEM_ENDPOINTS.LIST());
  return data.results;
}

export async function createGradingSystem(payload: CreateGradingSystemPayload): Promise<GradingSystem> {
  const { data } = await apiClient.post<GradingSystem>(GRADING_SYSTEM_ENDPOINTS.LIST(), payload);
  return data;
}

export async function updateGradingSystem(
  id: string,
  payload: UpdateGradingSystemPayload,
): Promise<GradingSystem> {
  const { data } = await apiClient.patch<GradingSystem>(GRADING_SYSTEM_ENDPOINTS.DETAIL(id), payload);
  return data;
}

export async function deleteGradingSystem(id: string): Promise<void> {
  await apiClient.delete(GRADING_SYSTEM_ENDPOINTS.DETAIL(id));
}
