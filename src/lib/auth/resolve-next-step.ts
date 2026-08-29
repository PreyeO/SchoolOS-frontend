import { env } from "@/config/env";
import { buildSchoolUrl } from "@/lib/tenant/school-url";

// Whether this build is actually served from the school domain, and so can hand
// a user off to https://<slug>.<domain>.
//
// NODE_ENV === "production" used to stand in for this, but it answers a
// different question: a Vercel deployment is also "production" while being
// served from *.vercel.app, so login sent people to a host we don't own and the
// session appeared to vanish. Reading the real hostname keeps that redirect
// switched off everywhere except the domain that can serve it, and switches it
// back on by itself once myschoolos.io points here — no env var to remember.
function servesSchoolSubdomains(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === env.SCHOOL_DOMAIN || host.endsWith(`.${env.SCHOOL_DOMAIN}`);
}

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
    // completePath, not "/admin": there is no /admin route — src/app/(dashboard)/admin
    // is an empty directory — so the hand-off landed on a 404 even on a domain
    // that could serve it. The subdomain should open the same page the local
    // path would.
    if (slug && servesSchoolSubdomains()) {
      return { path: buildSchoolUrl(slug, completePath), external: true };
    }
    return { path: completePath, external: false };
  }

  return { path: "/", external: false };
}
