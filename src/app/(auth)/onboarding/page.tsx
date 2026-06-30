import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Welcome to SchoolOS" };

export default function OnboardingPage() {
  return (
    <div className="flex flex-col justify-center min-h-screen lg:min-h-0 py-12 px-6 sm:px-10">
      <div className="w-full max-w-md mx-auto">
        <Link
          href="/"
          className="lg:hidden inline-block font-display text-xl font-bold text-ink tracking-tight mb-8"
        >
          School<span className="text-brand">OS</span>
        </Link>
        <h1 className="font-display text-3xl font-bold text-ink">
          Welcome to SchoolOS
        </h1>
        <p className="mt-3 text-n-500 leading-relaxed">
          Your school is set up and ready to go. The dashboard is coming in the
          next phase.
        </p>
      </div>
    </div>
  );
}
