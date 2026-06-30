import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-center min-h-screen lg:min-h-0 py-12 px-6 sm:px-10">
      <div className="w-full max-w-md mx-auto">
        <h1 className="font-display text-3xl font-bold text-ink">Log in</h1>
        <p className="mt-3 text-n-500">Login coming in Phase 3.3.</p>
        <p className="mt-6 text-sm text-n-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand underline underline-offset-4">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
