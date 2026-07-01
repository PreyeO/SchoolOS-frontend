"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const tokens = useAuthStore((s) => s.tokens);

  useEffect(() => {
    if (!tokens) router.replace("/login");
  }, [tokens, router]);

  // Zustand starts with tokens=null before rehydrating from sessionStorage,
  // so both server and initial client render return null — no hydration mismatch.
  if (!tokens) return null;
  return <>{children}</>;
}
