import { apiClient } from "@/lib/api/client";
import { SCHOOL_ENDPOINTS } from "@/lib/api/endpoints";
import type { StepKey } from "./onboarding-steps";

// Confirmed against accounts/serializers.py OnboardingProgressSerializer —
// fields match exactly.
export interface OnboardingStageResponse {
  current_step: StepKey;
  skipped_steps: StepKey[];
  is_completed: boolean;
  completed_at: string | null;
}

// GET /api/schools/:id/onboarding/. Lives in lib/ (not features/onboarding/)
// because the post-auth routing layer (lib/auth/resolve-post-auth-path.ts)
// also needs it to decide dashboard vs onboarding on login/verify/create-school,
// before the onboarding feature loads.
export async function getOnboardingStage(schoolId: string): Promise<OnboardingStageResponse> {
  const { data } = await apiClient.get<OnboardingStageResponse>(SCHOOL_ENDPOINTS.ONBOARDING_STAGE(schoolId));
  return data;
}
