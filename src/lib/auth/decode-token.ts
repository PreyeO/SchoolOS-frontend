import { jwtDecode } from "jwt-decode";

export interface AuthClaims {
  school_id: string | null;
  // Identifies this person *at this school*, so anything stored on the device
  // can be scoped to them. school_id alone isn't enough — two teachers at one
  // school sharing a staffroom browser would collide on it.
  membership_id: string | null;
  personas: string[];
  is_platform_admin: boolean;
}

interface RawClaims {
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
      school_id: raw.school_id != null ? String(raw.school_id) : null,
      membership_id: raw.membership_id != null ? String(raw.membership_id) : null,
      personas: Array.isArray(raw.personas) ? raw.personas : [],
      is_platform_admin: raw.is_platform_admin === true,
    };
  } catch {
    return { school_id: null, membership_id: null, personas: [], is_platform_admin: false };
  }
}
