import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OtpForm } from "@/features/auth/components/otp-form";

export const metadata: Metadata = { title: "Verify email" };

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email: rawEmail } = await searchParams;
  const email = rawEmail ? decodeURIComponent(rawEmail) : null;

  if (!email) redirect("/signup");

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
            Check your email
          </h1>
          <p className="mt-3 text-n-500 leading-relaxed">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-ink">{email}</span>.
          </p>
        </div>

        <OtpForm email={email} />

        <p className="mt-6 text-sm text-n-400">
          Wrong email?{" "}
          <Link
            href="/signup"
            className="text-brand underline underline-offset-4"
          >
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
}
