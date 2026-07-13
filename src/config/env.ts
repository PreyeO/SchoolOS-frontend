export const env = {
  // Never throws here — this getter runs at module-evaluation time (e.g. axios.create()
  // in lib/api/client.ts), which Next.js also executes while statically prerendering
  // pages at build time. Throwing there breaks the build even for pages that never
  // make a request. The real "is this actually configured" check lives in the
  // request interceptor, which only ever runs client-side when a call is made.
  get API_BASE_URL(): string {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  },
  get SCHOOL_DOMAIN(): string {
    return process.env.NEXT_PUBLIC_SCHOOL_DOMAIN ?? "schoolos.com";
  },
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "SchoolOS",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
} as const;
