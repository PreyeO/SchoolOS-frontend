// Typed wrapper around environment variables.
// Always import env values from here — never from process.env directly in components.
// TODO (Phase 2): add runtime validation (e.g. zod) if needed.

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "SchoolOS",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
} as const;
