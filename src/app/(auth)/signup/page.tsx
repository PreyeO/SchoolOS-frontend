import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="flex flex-col justify-center min-h-screen lg:min-h-0 py-12 px-6 sm:px-10">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="lg:hidden inline-block font-display text-xl font-bold text-ink tracking-tight mb-8"
          >
            School<span className="text-brand">OS</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink">
            Create your account
          </h1>
          <p className="mt-2 text-n-500">Get started free — no card required.</p>
        </div>

        <SignupForm />

        <p className="mt-6 text-center text-sm text-n-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand hover:text-brand/80 underline underline-offset-4"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
