import type { Metadata } from "next";

export const metadata: Metadata = { title: "Platform admin — SchoolOS" };

export default function PlatformPage() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-n-400">
          SchoolOS staff
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">Platform admin</h1>
        <p className="mt-3 text-n-500 leading-relaxed">
          You&apos;re signed in as a platform administrator. The internal admin area is
          coming in a future phase.
        </p>
      </div>
    </div>
  );
}
