import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isApexHost } from "@/lib/tenant/is-apex-host";

// Sends a school subdomain's root to /login, while the apex keeps serving the
// marketing landing page.
//
// Runs server-side before anything renders, so there's no flash of the wrong
// page — the reason this isn't a useEffect redirect in a client component.
//
// FILENAME: this is `proxy.ts`, not `middleware.ts`. Next 16 deprecated the
// `middleware` file convention and renamed it to `proxy`, along with the
// exported function (see node_modules/next/dist/docs/01-app/02-guides/
// upgrading/version-16.md, line 625). The old name still works but warns, and
// `proxy` runs on the nodejs runtime — edge is explicitly unsupported.
//
// The apex-vs-tenant decision lives in lib/tenant/is-apex-host so it can be
// tested directly; see the note there on why it's shape-first rather than
// purely driven by NEXT_PUBLIC_SCHOOL_DOMAIN.
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const schoolDomain = process.env.NEXT_PUBLIC_SCHOOL_DOMAIN ?? "myschoolos.io";

  if (!isApexHost(host, schoolDomain)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Only the site root. Every other path — /login itself, /dashboard, /platform,
// static assets — is untouched.
//
// Without a matcher this runs on every request including /_next/static and
// /public, which the docs warn can block CSS and JS from loading. Scoping to
// "/" makes that impossible rather than relying on negative patterns.
export const config = {
  matcher: "/",
};
