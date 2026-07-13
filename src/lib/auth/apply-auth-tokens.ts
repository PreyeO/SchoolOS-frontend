import { useAuthStore } from "@/stores/auth-store";
import { decodeToken, type AuthClaims } from "./decode-token";

// Stores fresh tokens and decodes+stores their claims in one step. Used by
// every flow that receives tokens (login, verify-otp, create-school) so
// school_id/personas/is_platform_admin are always available immediately after.
export function applyAuthTokens(access: string, refresh: string): AuthClaims {
  useAuthStore.getState().setTokens({ access, refresh });
  const claims = decodeToken(access);
  useAuthStore.getState().setClaims(claims);
  return claims;
}
