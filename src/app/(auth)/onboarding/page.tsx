import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth/auth-guard";
import { OnboardingAccessGuard } from "@/features/onboarding/components/onboarding-access-guard";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";

export const metadata: Metadata = { title: "Set up your school" };

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingAccessGuard>
        <div className="py-12 px-6 sm:px-10">
          <div className="w-full max-w-2xl mx-auto">
            <div className="mb-10">
              <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-n-400 mb-2">
                Getting started
              </p>
              <h1 className="font-display text-3xl font-bold text-ink">
                Let&rsquo;s finish setting up your school
              </h1>
              <p className="mt-2 text-n-500">
                These steps take about 5 minutes. You can skip any step and come back later.
              </p>
            </div>
            <OnboardingWizard />
          </div>
        </div>
      </OnboardingAccessGuard>
    </AuthGuard>
  );
}
