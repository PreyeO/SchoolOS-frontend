import { jwtDecode } from "jwt-decode";

export interface AuthClaims {
  school_id: string | null;
  personas: string[];
  is_platform_admin: boolean;
}

interface RawClaims {
  school_id?: string | number | null;
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
      personas: Array.isArray(raw.personas) ? raw.personas : [],
      is_platform_admin: raw.is_platform_admin === true,
    };
  } catch {
    return { school_id: null, personas: [], is_platform_admin: false };
  }
}
