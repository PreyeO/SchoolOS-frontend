"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/auth-store";
import { canDoOnboarding } from "@/lib/auth/can-do-onboarding";

// Gates /onboarding to permitted personas. Nested inside AuthGuard, which
// already guarantees tokens (and therefore claims) exist by the time this runs.
export function OnboardingAccessGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const claims = useAuthStore((s) => s.claims);
  const allowed = canDoOnboarding(claims);

  useEffect(() => {
    if (claims && !allowed) {
      toast.error("You don't have access to school setup.");
      router.replace("/dashboard");
    }
  }, [claims, allowed, router]);

  if (claims && !allowed) return null;
  return <>{children}</>;
}
