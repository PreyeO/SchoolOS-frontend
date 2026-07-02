import { buildSchoolUrl } from "@/lib/tenant/school-url";

interface NextStepArgs {
  state: string;
  requiresSchoolSelection?: boolean;
  slug?: string;
  // Where "complete" leads locally. Create-school flow defaults to onboarding;
  // login passes "/dashboard".
  completePath?: string;
}

export function resolveNextStep({
  state,
  requiresSchoolSelection,
  slug,
  completePath = "/onboarding",
}: NextStepArgs): {
  path: string;
  external: boolean;
} {
  if (state === "create_school") {
    return { path: "/create-school", external: false };
  }

  if (state === "complete") {
    // multi-school selection handled in the login flow
    if (requiresSchoolSelection) {
      return { path: completePath, external: false };
    }
    if (slug && process.env.NODE_ENV === "production") {
      return { path: buildSchoolUrl(slug, "/admin"), external: true };
    }
    return { path: completePath, external: false };
  }

  return { path: "/", external: false };
}
