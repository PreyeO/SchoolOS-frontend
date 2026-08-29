import { jwtDecode } from "jwt-decode";

export interface AuthClaims {
  // The User row, not a profile or membership. Present on every token
  // including a platform admin's — which is the only reason a platform admin
  // can identify themselves at all, since /auth/me/ 403s for them and the
  // staff list has to be matched on this.
  user_id: string | null;
  school_id: string | null;
  // Identifies this person *at this school*, so anything stored on the device
  // can be scoped to them. school_id alone isn't enough — two teachers at one
  // school sharing a staffroom browser would collide on it.
  membership_id: string | null;
  personas: string[];
  is_platform_admin: boolean;
}

interface RawClaims {
  user_id?: string | number | null;
  school_id?: string | number | null;
  membership_id?: string | number | null;
  personas?: string[];
  is_platform_admin?: boolean;
}

// Reads routing-relevant claims from the access JWT. Never throws — a malformed
// token yields empty claims so the caller can fall back gracefully.
export function decodeToken(access: string): AuthClaims {
  try {
    const raw = jwtDecode<RawClaims>(access);
    return {
      user_id: raw.user_id != null ? String(raw.user_id) : null,
      school_id: raw.school_id != null ? String(raw.school_id) : null,
      membership_id: raw.membership_id != null ? String(raw.membership_id) : null,
      personas: Array.isArray(raw.personas) ? raw.personas : [],
      is_platform_admin: raw.is_platform_admin === true,
    };
  } catch {
    return {
      user_id: null,
      school_id: null,
      membership_id: null,
      personas: [],
      is_platform_admin: false,
    };
  }
}
