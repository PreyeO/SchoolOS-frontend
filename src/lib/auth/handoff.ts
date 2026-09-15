import { env } from "@/config/env";
import { hostingEnvironment } from "@/lib/tenant/tenant-host";

// Moving a session from the apex to a school's own subdomain, so signing in at
// www.myschoolos.io lands on fgc.myschoolos.io/dashboard.
//
// The token is portable — the backend validates a signature, not an origin — but
// localStorage is scoped per origin, so it has to be carried across explicitly.
//
// Carried in the URL FRAGMENT. An earlier version used postMessage into a hidden
// iframe, which kept the tokens out of the URL entirely and worked in Chrome,
// but Safari partitions storage for a cross-origin iframe: the bridge wrote to a
// partitioned bucket that the top-level subdomain then couldn't read, so the
// hand-off silently did nothing there.
//
// A fragment is never sent to a server (not in the request line, not in
// Referer), so this leaks to no log. What it does touch is browser history —
// which is why the landing page strips it on arrival and immediately rotates
// the refresh token, blacklisting the copy that was in the URL. Verified live:
// refresh now returns a new pair and the old token 401s with
// "Token is blacklisted".
export const HANDOFF_PATH = "/auth-handoff";

export const HANDOFF_PARAMS = {
  access: "a",
  refresh: "r",
  next: "next",
} as const;

// Only a same-site path may be handed on. Anything absolute, protocol-relative,
// or backslash-prefixed is discarded in favour of the dashboard — the `next`
// value arrives from a URL, and echoing it into a redirect unchecked is an open
// redirect with a freshly-minted session attached.
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return "/dashboard";
  if (!next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//") || next.startsWith("/\\")) return "/dashboard";
  return next;
}

export function buildHandoffUrl(slug: string, access: string, refresh: string, next: string): string {
  const params = new URLSearchParams({
    [HANDOFF_PARAMS.access]: access,
    [HANDOFF_PARAMS.refresh]: refresh,
    [HANDOFF_PARAMS.next]: safeNextPath(next),
  });

  // Same hosting environment as the page we're leaving, not always production.
  //
  // The backend computes School.subdomain as {slug}{SCHOOL_SUBDOMAIN_SUFFIX}.
  // {SCHOOL_DOMAIN}, and hosted backend-dev sets that suffix to "-dev" — so
  // fgc's real dev tenant is fgc-dev.myschoolos.io, not fgc.myschoolos.io.
  // NEXT_PUBLIC_SCHOOL_DOMAIN is the same value in every environment (there's
  // no NEXT_PUBLIC_SCHOOL_SUBDOMAIN_SUFFIX), so building the URL from env alone
  // always produces the production shape — on frontend-dev that hands the
  // session to a host with no matching school (or, worse, a real production
  // school that happens to share the slug). Reading the suffix off the current
  // hostname instead means the hand-off always stays inside the deployment it
  // started in.
  const environment = typeof window !== "undefined" ? hostingEnvironment(window.location.hostname) : "";

  return `https://${slug}${environment}.${env.SCHOOL_DOMAIN}${HANDOFF_PATH}#${params.toString()}`;
}
