"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthState {
  pendingVerificationEmail: string | null;
  // production should move tokens to httpOnly cookies — web storage is XSS-exposed
  tokens: AuthTokens | null;
  setPendingVerificationEmail: (email: string) => void;
  clearPendingVerificationEmail: () => void;
  setTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
}

const ssrSafeSessionStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window !== "undefined") sessionStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window !== "undefined") sessionStorage.removeItem(name);
  },
} as Storage;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      pendingVerificationEmail: null,
      tokens: null,
      setPendingVerificationEmail: (email) =>
        set({ pendingVerificationEmail: email }),
      clearPendingVerificationEmail: () =>
        set({ pendingVerificationEmail: null }),
      setTokens: (tokens) => set({ tokens }),
      clearAuth: () => set({ pendingVerificationEmail: null, tokens: null }),
    }),
    {
      name: "schoolos-auth",
      storage: createJSONStorage(() => ssrSafeSessionStorage),
    }
  )
);
