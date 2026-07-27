import { useAuthStore } from "@/stores/auth-store";
import { getSchoolId } from "@/lib/school/get-school-id";
import { getOnboardingStage } from "@/lib/school/get-onboarding-stage";
import { canDoOnboarding } from "./can-do-onboarding";
import { resolveNextStep } from "./resolve-next-step";

interface Args {
  state: string;
  slug?: string;
}

// Centralized post-auth destination resolver, used by login/verify-otp/create-school
// after applyAuthTokens() has already stored tokens+claims. Layers the real
// onboarding-stage check on top of the existing sync resolveNextStep: state ===
// "create_school" or an external subdomain redirect short-circuit as before;
// only the local "complete" destination gets refined into dashboard vs onboarding.
export async function resolvePostAuthPath({ state, slug }: Args): Promise<{ path: string; external: boolean }> {
  const claims = useAuthStore.getState().claims;
  if (claims?.is_platform_admin) return { path: "/platform", external: false };

  const base = resolveNextStep({ state, slug, completePath: "/dashboard" });
  if (base.external || base.path !== "/dashboard") return base;

  const schoolId = getSchoolId();
  if (!schoolId || !canDoOnboarding(claims)) return base;

  try {
    const stage = await getOnboardingStage(schoolId);
    return { path: stage.is_completed ? "/dashboard" : "/onboarding", external: false };
  } catch {
    // Fail open to onboarding rather than strand the user on a broken dashboard.
    return { path: "/onboarding", external: false };
  }
}
