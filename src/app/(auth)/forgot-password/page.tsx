import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col justify-center min-h-screen lg:min-h-0 py-12 px-6 sm:px-10">
      <div className="w-full max-w-md mx-auto">
        <Link
          href="/"
          className="lg:hidden inline-block font-display text-xl font-bold text-ink tracking-tight mb-8"
        >
          School<span className="text-brand">OS</span>
        </Link>
        <h1 className="font-display text-3xl font-bold text-ink">Reset your password</h1>
        <p className="mt-3 text-n-500 leading-relaxed">
          Password reset isn&apos;t available just yet. In the meantime, contact your
          school administrator for help getting back into your account.
        </p>
        <p className="mt-6 text-sm text-n-500">
          <Link href="/login" className="text-brand underline underline-offset-4">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
