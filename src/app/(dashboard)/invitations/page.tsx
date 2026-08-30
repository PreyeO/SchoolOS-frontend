import type { Metadata } from "next";

import { InvitePeoplePanel } from "@/features/invitations/components/invite-people-panel";
import { PendingInvitesPanel } from "@/features/invitations/components/pending/pending-invites-panel";
import { parseInvitePersona } from "@/features/invitations/lib/invite-persona-param";

export const metadata: Metadata = { title: "Invitations" };

// ?persona= decides which form opens, so the directories' "Invite teacher" /
// "Add student" buttons land on the matching one. Read here rather than via
// useSearchParams() in the panel — same server-side searchParams pattern the
// reset-password route uses, and it avoids needing a Suspense boundary.
export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string }>;
}) {
  const { persona } = await searchParams;

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Invite people</h1>
          <p className="mt-1 text-sm text-n-500">
            Invite school admins, teachers, and parents by email, or create a student account
            directly.
          </p>
        </div>
        <InvitePeoplePanel initialPersona={parseInvitePersona(persona)} />
      </div>

      <PendingInvitesPanel />
    </div>
  );
}
