import type { PendingInvite } from "../../types";
import { PendingInviteRow } from "./pending-invite-row";

export function PendingInvitesTable({ invites }: { invites: PendingInvite[] }) {
  if (invites.length === 0) {
    return (
      <div className="rounded-xl border border-n-200 bg-white py-10 text-center">
        <p className="text-sm text-n-400 italic">No invites match.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            <th className="px-3 py-2.5 font-medium">Email</th>
            <th className="px-3 py-2.5 font-medium">Invited as</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 font-medium">Sent</th>
            <th className="px-3 py-2.5 font-medium">Expires</th>
            <th className="px-3 py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => (
            <PendingInviteRow key={invite.id} invite={invite} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
