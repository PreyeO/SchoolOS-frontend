import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Sends a tenant subdomain's root straight to /login, while the apex keeps
// serving the marketing landing page.
//
// Runs server-side before anything renders, so there is no flash of the wrong
// page — the reason this isn't a useEffect redirect in a client component.
//
// NOTE ON THE FILENAME: this is `proxy.ts`, not `middleware.ts`. Next 16
// deprecated the `middleware` file convention and renamed it to `proxy`, and
// the exported function is `proxy` rather than `middleware`
// (node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md, line
// 625). The old name still works but warns, and `proxy` runs on the nodejs
// runtime — the edge runtime is explicitly NOT supported here.

// Hosts that serve the marketing site rather than a school.
//
// Read from the env rather than hardcoded so a preview deploy on some other
// domain doesn't bounce its own landing page. `www` is listed separately
// because it is a subdomain by shape but the apex by intent.
const APEX = process.env.NEXT_PUBLIC_SCHOOL_DOMAIN ?? "myschoolos.io";

// Local development hosts. `lvh.me` resolves to 127.0.0.1 and is what the app
// already uses to exercise subdomain routing locally (see
// lib/tenant/get-current-school-slug.ts) — so `gcu.lvh.me` SHOULD be treated
// as a tenant and bounced, while bare `lvh.me` and `localhost` should not.
const LOCAL_APEXES = ["localhost", "127.0.0.1", "lvh.me"];

function isApexHost(host: string): boolean {
  // Strip the port — `localhost:3002` and `gcu.lvh.me:3002` both arrive with one.
  const hostname = host.split(":")[0].toLowerCase();

  if (hostname === APEX || hostname === `www.${APEX}`) return true;
  if (LOCAL_APEXES.includes(hostname)) return true;
  if (hostname === `www.lvh.me`) return true;

  // A host we don't recognise at all — a preview deploy, a raw IP, a platform
  // domain like *.vercel.app. Treated as apex so the landing page still
  // renders there. Bouncing an unrecognised host to /login would break every
  // preview URL, and this redirect is a convenience, not a security boundary.
  const isTenantOfKnownBase =
    hostname.endsWith(`.${APEX}`) || hostname.endsWith(".lvh.me");
  return !isTenantOfKnownBase;
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (!isApexHost(host)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Only the site root. Every other path — /login itself, /dashboard, /platform,
// the API routes, static assets — is left alone.
//
// Without a matcher this would run on every request including /_next/static
// and /public, which the docs warn can block CSS and JS from loading. Scoping
// it to "/" makes that impossible rather than relying on negative patterns.
export const config = {
  matcher: "/",
};
