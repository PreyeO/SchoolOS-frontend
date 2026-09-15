export const env = {
  // Never throws here — this getter runs at module-evaluation time (e.g. axios.create()
  // in lib/api/client.ts), which Next.js also executes while statically prerendering
  // pages at build time. Throwing there breaks the build even for pages that never
  // make a request. The real "is this actually configured" check lives in the
  // request interceptor, which only ever runs client-side when a call is made.
  get API_BASE_URL(): string {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  },
  // The apex the tenant subdomains hang off. Must match what the backend
  // computes for School.subdomain ({slug}{SCHOOL_SUBDOMAIN_SUFFIX}.myschoolos.io
  // — confirmed live), or the post-login redirect sends people to a host that
  // doesn't exist.
  //
  // ALWAYS THE BARE APEX ("myschoolos.io"), IN EVERY ENVIRONMENT — never set
  // this to an environment-specific host like "frontend-dev.myschoolos.io".
  // The backend's hosted-dev "-dev" hosting suffix (SCHOOL_SUBDOMAIN_SUFFIX)
  // is detected automatically from the CURRENT hostname by
  // lib/tenant/tenant-host.ts's hostingEnvironment(), specifically so this
  // never needs to vary per deployment. Get it wrong and buildHandoffUrl
  // produces a host two labels past the apex (e.g.
  // gcu.frontend-dev.myschoolos.io) — one level deeper than the *.myschoolos.io
  // wildcard DNS/worker covers, and outside the backend's
  // CORS_ALLOWED_ORIGIN_REGEXES (one label only) even if it did resolve. Live
  // config drift here is silent by default — check the `x-schoolos-routing`
  // response header's `domain=` value if a hand-off ever 404s/DNS-fails.
  get SCHOOL_DOMAIN(): string {
    return process.env.NEXT_PUBLIC_SCHOOL_DOMAIN ?? "myschoolos.io";
  },
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "SchoolOS",
  // Matches app/layout.tsx's metadataBase fallback deliberately — the two
  // describe the same thing (where this app is served from) and disagreed:
  // this defaulted to localhost:3000 while the layout defaulted to the real
  // domain. With NEXT_PUBLIC_APP_URL unset in production that produced an
  // og:image pointing at http://localhost:3000, which resolves to nothing for
  // anyone sharing a link. The local dev value comes from .env.local.
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://myschoolos.io",
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
} as const;
