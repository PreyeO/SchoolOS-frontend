// Barrel for every API path in the app. Split by domain under ./endpoints/ —
// consumers still import from "@/lib/api/endpoints" and see no difference.
//
// Paths live here and nowhere else: PROJECT.md's "no hardcoded URLs in
// components" rule depends on this being the single source of truth, and
// client.ts's public-route allowlist reads from it for the same reason.
export * from "./endpoints/auth";
export * from "./endpoints/academic";
export * from "./endpoints/results";
export * from "./endpoints/people";
export * from "./endpoints/fees";
