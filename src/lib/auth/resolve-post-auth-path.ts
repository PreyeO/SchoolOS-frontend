import { useAuthStore } from "@/stores/auth-store";
import { getSchoolId } from "@/lib/school/get-school-id";
import { getOnboardingStage } from "@/lib/school/get-onboarding-stage";
import { canDoOnboarding } from "./can-do-onboarding";
import { resolveNextStep } from "./resolve-next-step";

interface Args {
  state: string;
}

// Centralized post-auth destination resolver, used by login/verify-otp/
// create-school/accept-invite after applyAuthTokens() has stored tokens+claims.
// Layers the real onboarding-stage check on top of resolveNextStep: only the
// "complete" destination gets refined into dashboard vs onboarding.
//
// Always same-origin now — see resolveNextStep for why the subdomain hand-off
// was removed. A useful side effect: the onboarding-stage refinement below no
// longer gets skipped, which it was for anyone the redirect caught.
export async function resolvePostAuthPath({ state }: Args): Promise<{ path: string }> {
  const claims = useAuthStore.getState().claims;
  if (claims?.is_platform_admin) return { path: "/platform" };

  const base = resolveNextStep({ state, completePath: "/dashboard" });
  if (base.path !== "/dashboard") return base;

  const schoolId = getSchoolId();
  if (!schoolId || !canDoOnboarding(claims)) return base;

  try {
    const stage = await getOnboardingStage(schoolId);
    return { path: stage.is_completed ? "/dashboard" : "/onboarding" };
  } catch {
    // Fail open to onboarding rather than strand the user on a broken dashboard.
    return { path: "/onboarding" };
  }
}
