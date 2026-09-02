"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { AuthClaims } from "@/lib/auth/decode-token";
import { clearPersistedQueryCaches } from "@/lib/api/query-persistence";
import { clearAllRegisterDrafts } from "@/features/attendance/lib/draft-storage";
import { clearAllScoreDrafts } from "@/features/results/lib/score-draft-storage";
import { AUTH_STORAGE_KEY, ssrSafeLocalStorage } from "@/lib/storage/ssr-safe-local-storage";
import { useSchoolStore } from "./school-store";

export interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthState {
  pendingVerificationEmail: string | null;
  // production should move tokens to httpOnly cookies — web storage is XSS-exposed
  tokens: AuthTokens | null;
  claims: AuthClaims | null;
  // True once persist has finished reading localStorage. Reading `tokens`
  // before this flips is meaningless — it's always null on the very first
  // render regardless of whether a session actually exists — so anything
  // deciding "is this user logged in" (AuthGuard, LoginView) must wait for it
  // instead of treating an unhydrated null as a real logged-out state.
  hasHydrated: boolean;
  setPendingVerificationEmail: (email: string) => void;
  clearPendingVerificationEmail: () => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setClaims: (claims: AuthClaims | null) => void;
  // Drops the session and nothing else. Distinct from clearAuth, which also
  // wipes the offline query cache and a teacher's queued register/score drafts
  // — right when a session ENDS on a shared device, wrong when it is being
  // handed to another origin, where deleting unsubmitted work would be silent
  // data loss. Used by the apex→subdomain hand-off; see use-login.
  clearSession: () => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      pendingVerificationEmail: null,
      tokens: null,
      claims: null,
      hasHydrated: false,
      setPendingVerificationEmail: (email) =>
        set({ pendingVerificationEmail: email }),
      clearPendingVerificationEmail: () =>
        set({ pendingVerificationEmail: null }),
      setTokens: (tokens) => set({ tokens }),
      setClaims: (claims) => set({ claims }),
      clearSession: () => set({ tokens: null, claims: null }),
      clearAuth: () => {
        // The offline cache holds a teacher's roster, any queued register or
        // score batch, and the draft stores hold half-finished ones. Leaving any
        // of it behind on a shared staffroom device would expose one teacher's
        // class — and their pupils' marks — to the next person to sign in.
        clearPersistedQueryCaches();
        clearAllRegisterDrafts();
        clearAllScoreDrafts();
        // The school context is persisted separately and outlived its own
        // session: getSchoolId() falls back to currentSchool.id when the token
        // carries no school_id, so a leftover school makes the NEXT user look
        // school-scoped. That became a real problem once platform admins
        // existed — their token has no school_id by design, so a stale
        // currentSchool un-gates school-scoped queries they can only 403 on.
        // Until now only UserMenu's logout cleared it, which meant the forced
        // logout path (token-refresh) never did.
        //
        // getState() rather than the hook — this runs outside React.
        useSchoolStore.getState().clearSchool();
        set({ pendingVerificationEmail: null, tokens: null, claims: null });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      // Shared with query-persistence, which reads membership_id straight out
      // of this blob to scope the offline cache — see readPersistedMembershipId.
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => ssrSafeLocalStorage),
      partialize: (state) => ({
        pendingVerificationEmail: state.pendingVerificationEmail,
        tokens: state.tokens,
        claims: state.claims,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
