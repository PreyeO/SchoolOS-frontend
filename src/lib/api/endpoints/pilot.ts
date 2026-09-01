// Confirmed against the live backend (demo_requests app, merged 2026-09-01).
//
// One path, two audiences:
//   POST   — AllowAny, the public marketing form. No Bearer token; it's in
//            client.ts's PUBLIC_PATHS so a signed-in admin filling in the
//            pilot form doesn't attach their credentials to it.
//   GET    — platform admins holding view_platform_demo_requests.
//   PATCH  — platform admins holding manage_platform_demo_requests, and it
//            accepts ONLY { status }. Every lead-submitted field is immutable
//            server-side (verified: sending school_name alongside status left
//            the name untouched). There is no DELETE — it 405s.
export const PILOT_ENDPOINTS = {
  DEMO_REQUEST: "/api/demo-requests/",
  DEMO_REQUEST_DETAIL: (id: string) => `/api/demo-requests/${id}/`,
} as const;
