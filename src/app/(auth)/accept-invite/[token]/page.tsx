import type { Metadata } from "next";
import Link from "next/link";

import { AcceptInviteView } from "@/features/invitations/components/accept-invite-view";

// Bare title: the root layout's "%s | SchoolOS" template appends the brand,
// same as every other page in this group.
export const metadata: Metadata = { title: "Accept invite" };

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="flex flex-col justify-center min-h-screen lg:min-h-0 py-12 px-6 sm:px-10">
      <div className="w-full max-w-md mx-auto">
        <Link
          href="/"
          className="lg:hidden inline-block font-display text-xl font-bold text-ink tracking-tight mb-8"
        >
          School<span className="text-brand">OS</span>
        </Link>

        <AcceptInviteView token={token} />
      </div>
    </div>
  );
}
