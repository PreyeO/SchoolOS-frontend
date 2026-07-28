"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const tokens = useAuthStore((s) => s.tokens);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // tokens is always null before persist finishes reading sessionStorage —
  // redirecting on that alone (before hasHydrated flips) was sending a
  // genuinely logged-in user refreshing any dashboard page on a brief detour
  // through /login, which then bounced them to /dashboard instead of back to
  // whichever page they'd refreshed.
  useEffect(() => {
    if (hasHydrated && !tokens) router.replace("/login");
  }, [hasHydrated, tokens, router]);

  if (!hasHydrated || !tokens) return null;
  return <>{children}</>;
}
