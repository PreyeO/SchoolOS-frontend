import type { AuthClaims } from "./decode-token";

// Onboarding is the Owner's setup wizard — confirmed against the backend
// (accounts/tokens.py emits "owner" in personas when the membership's admin
// role has is_owner=True; accounts/permissions.py's IsSchoolOwner enforces
// the same restriction server-side on the onboarding/advance/review actions).
export function canDoOnboarding(claims: AuthClaims | null): boolean {
  return claims?.personas.includes("owner") ?? false;
}
