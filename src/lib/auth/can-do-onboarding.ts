import type { AuthClaims } from "./decode-token";

// TODO: restrict to "owner" once the backend adds a distinct owner persona.
// Admins are allowed through for now — flip this one line when it's ready.
export function canDoOnboarding(claims: AuthClaims | null): boolean {
  return claims?.personas.includes("admin") ?? false;
}
