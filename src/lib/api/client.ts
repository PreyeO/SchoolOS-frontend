import axios from "axios";

import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth-store";

import {
  ENDPOINTS,
  PILOT_ENDPOINTS,
  RESULT_CHECK_ENDPOINTS,
  SCRATCH_CARD_ENDPOINTS,
  WALLET_ENDPOINTS,
} from "./endpoints";
import { installTokenRefresh, syncAuthAcrossTabs } from "./token-refresh";

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

interface PublicRule {
  path: string;
  // Absent means the whole path is public. Present means ONLY these methods
  // are — the rest still get a token.
  //
  // This exists because /api/demo-requests/ serves two audiences on one path:
  // POST is the public marketing form, while GET and PATCH are the platform
  // admin's lead queue. Listing it as wholly public sent the admin's reads out
  // with no Authorization header, and the panel failed with "Authentication
  // credentials were not provided" — while the refresh interceptor, which
  // shares this predicate, declined to retry because it thought the path was
  // public.
  methods?: readonly string[];
}

// Public endpoints must never receive an Authorization header. A stale token in
// the store would otherwise be attached to signup/login and reject with 401.
// The refresh endpoint is included so it never gets a *stale access* token
// attached, and so its own 401s don't recurse into the refresh logic.
//
// Every entry comes from ENDPOINTS rather than a literal. Four of these were
// hardcoded copies of the same paths, which meant renaming an endpoint would
// leave this list silently unmatched — and a stale token then rides along on
// login or signup and 401s the request. The bug would look like "login is
// broken", nowhere near the edit that caused it.
const PUBLIC_RULES: readonly PublicRule[] = [
  { path: ENDPOINTS.USERS }, // signup
  { path: ENDPOINTS.VERIFY_EMAIL },
  { path: ENDPOINTS.RESEND_OTP },
  { path: ENDPOINTS.LOGIN },
  { path: ENDPOINTS.PASSWORD_RESET_REQUEST },
  { path: ENDPOINTS.PASSWORD_RESET_CONFIRM },
  { path: ENDPOINTS.REFRESH },
  // POST only. A signed-in admin who opens /book-demo shouldn't attach their
  // Bearer token to a pilot enquiry — but the platform panel reads and updates
  // those same leads on this path and must be authenticated.
  { path: PILOT_ENDPOINTS.DEMO_REQUEST, methods: ["post"] },
  // The public result checker. DRF authenticates before AllowAny is even
  // consulted, so a stale token on a parent's browser would 401 a page that
  // needs no login at all. VERIFY also matches verify/pdf/ (substring match).
  { path: RESULT_CHECK_ENDPOINTS.PERIODS() },
  { path: RESULT_CHECK_ENDPOINTS.VERIFY() },
  // Paystack's return to the school. Public by design; the reveal that follows
  // is a separate, authenticated route.
  { path: SCRATCH_CARD_ENDPOINTS.PAYMENT_RETURN() },
  // Same for a wallet top-up's return.
  { path: WALLET_ENDPOINTS.TOPUP_RETURN() },
];

export interface PublicRequestShape {
  url?: string;
  method?: string;
}

// axios lowercases config.method; default to "get" for the same reason axios
// does, so a config without one isn't accidentally matched as a public POST.
function isPublicRequest({ url, method }: PublicRequestShape): boolean {
  if (!url) return false;
  const verb = (method ?? "get").toLowerCase();
  return PUBLIC_RULES.some(
    (rule) => url.includes(rule.path) && (!rule.methods || rule.methods.includes(verb)),
  );
}

apiClient.interceptors.request.use((config) => {
  if (!env.API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Add it to .env.local (or your deployment's environment variables).",
    );
  }

  const token = useAuthStore.getState().tokens?.access;
  if (token && !isPublicRequest(config)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Silent-refresh-on-401, with the single-flight guard and forced logout — see
// token-refresh.ts. Installed here so this file stays the client definition and
// its request interceptor.
installTokenRefresh(apiClient, isPublicRequest);
// Every tab re-reads the shared session when another tab writes it, so one
// tab's refresh doesn't leave the others holding a spent, single-use token.
syncAuthAcrossTabs();

export { consumeSessionExpiredFlag } from "./token-refresh";
