import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email: rawEmail } = await searchParams;
  const email = rawEmail ? decodeURIComponent(rawEmail) : null;

  if (!email) redirect("/forgot-password");

  return (
    <div className="flex flex-col justify-center min-h-screen lg:min-h-0 py-12 px-6 sm:px-10">
      <div className="w-full max-w-md mx-auto">
        <Link
          href="/"
          className="lg:hidden inline-block font-display text-xl font-bold text-ink tracking-tight mb-8"
        >
          School<span className="text-brand">OS</span>
        </Link>
        <h1 className="font-display text-3xl font-bold text-ink">Check your email</h1>
        <p className="mt-3 text-n-500 leading-relaxed">
          If an account exists for{" "}
          <span className="font-medium text-ink">{email}</span>, we&rsquo;ve sent a 6-digit
          code. Enter it below with your new password.
        </p>

        <div className="mt-8">
          <ResetPasswordForm email={email} />
        </div>

        <p className="mt-6 text-sm text-n-400">
          Wrong email?{" "}
          <Link href="/forgot-password" className="text-brand underline underline-offset-4">
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
}
