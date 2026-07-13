import { toast } from "sonner";

import type { OnboardingStageResponse } from "@/lib/school/get-onboarding-stage";
import type { StepKey } from "@/lib/school/onboarding-steps";

interface Router {
  push: (path: string) => void;
}

// Shared by every step's save-then-advance hook: routes to the dashboard once
// the backend reports onboarding complete, otherwise hands the wizard the
// server's current_step (the source of truth for which step comes next).
export function handleStageResult(
  stage: OnboardingStageResponse,
  router: Router,
  onAdvanced: (currentStep: StepKey) => void,
) {
  if (stage.is_completed) {
    toast.success("School setup complete! Welcome to SchoolOS.");
    router.push("/dashboard");
  } else {
    onAdvanced(stage.current_step);
  }
}
