import type { Metadata } from "next";
import Link from "next/link";

import { LoginView } from "@/features/auth/components/login-view";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-center min-h-screen lg:min-h-0 py-12 px-6 sm:px-10">
      <div className="w-full max-w-md mx-auto">
        <Link
          href="/"
          className="lg:hidden inline-block font-display text-xl font-bold text-ink tracking-tight mb-8"
        >
          School<span className="text-brand">OS</span>
        </Link>
        <LoginView />
      </div>
    </div>
  );
}
