import { AUTH_STORAGE_KEY } from "@/lib/storage/ssr-safe-local-storage";

export interface StoredTokens {
  access: string;
  refresh: string;
}

// The token pair as saved in localStorage, which every tab shares. A tab's
// in-memory auth store can lag behind it (zustand's persist doesn't re-read
// storage when ANOTHER tab writes), so anything deciding "did another tab
// already refresh?" must read here, not the store. Never throws.
export function readPersistedTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const tokens = (JSON.parse(raw) as { state?: { tokens?: StoredTokens | null } }).state?.tokens;
    return tokens?.access && tokens.refresh ? tokens : null;
  } catch {
    return null;
  }
}
