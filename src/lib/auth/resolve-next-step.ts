interface NextStepArgs {
  state: string;
  requiresSchoolSelection?: boolean;
  // Where "complete" leads. Create-school flow defaults to onboarding;
  // login passes "/dashboard".
  completePath?: string;
}

// Where to send someone once they hold tokens.
//
// This used to hand off to https://<slug>.<domain> after login, and no longer
// does. Tokens live in localStorage, which is scoped per origin, so
// www.myschoolos.io and fggc.myschoolos.io do not share a session: redirecting
// across that boundary delivered the user to their subdomain with an empty
// token store, and straight back to /login.
//
// It only ever fired when the caller already knew the slug, which on the apex
// meant the multi-school picker alone — so the bug hit exactly the users with
// more than one school, and nobody else.
//
// The apex is now the canonical app host. Subdomains still work for anyone who
// goes to one directly: getCurrentSchoolSlug() reads the host and scopes their
// login automatically, and they stay there. What's gone is the forced hop.
//
// Reinstating it needs the session shared across subdomains first — a cookie
// scoped to .myschoolos.io, ideally httpOnly and set by the backend. Until
// that exists, sending anyone across origins mid-flow logs them out.
export function resolveNextStep({
  state,
  requiresSchoolSelection,
  completePath = "/onboarding",
}: NextStepArgs): { path: string } {
  if (state === "create_school") {
    return { path: "/create-school" };
  }

  if (state === "complete") {
    // multi-school selection handled in the login flow
    if (requiresSchoolSelection) {
      return { path: completePath };
    }
    // completePath, not "/admin": there is no /admin route — src/app/(dashboard)/admin
    // is an empty directory — so the hand-off landed on a 404.
    return { path: completePath };
  }

  return { path: "/" };
}
