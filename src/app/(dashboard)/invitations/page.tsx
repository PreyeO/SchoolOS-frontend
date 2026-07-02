import type { Metadata } from "next";

import { InvitePeoplePanel } from "@/features/invitations/components/invite-people-panel";

export const metadata: Metadata = { title: "Invitations — SchoolOS" };

export default function InvitationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Invite people</h1>
        <p className="mt-1 text-sm text-n-500">
          Invite school admins, teachers, and parents by email, or create a student account
          directly.
        </p>
      </div>
      <InvitePeoplePanel />
    </div>
  );
}
