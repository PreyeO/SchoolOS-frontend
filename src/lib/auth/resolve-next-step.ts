import { buildSchoolUrl } from "@/lib/tenant/school-url";

interface NextStepArgs {
  state: string;
  requiresSchoolSelection?: boolean;
  slug?: string;
}

export function resolveNextStep({ state, requiresSchoolSelection, slug }: NextStepArgs): {
  path: string;
  external: boolean;
} {
  if (state === "create_school") {
    return { path: "/create-school", external: false };
  }

  if (state === "complete") {
    // multi-school selection handled in the login flow
    if (requiresSchoolSelection) {
      return { path: "/onboarding", external: false };
    }
    if (slug && process.env.NODE_ENV === "production") {
      return { path: buildSchoolUrl(slug, "/admin"), external: true };
    }
    return { path: "/onboarding", external: false };
  }

  return { path: "/", external: false };
}
