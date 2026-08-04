"use client";

import { Button } from "@/components/ui/button";
import { useResendInvite } from "../../hooks/use-resend-invite";
import { formatDateTime } from "../../lib/format-datetime";
import { personaLabel } from "../../lib/persona-label";
import type { PendingInvite } from "../../types";
import { InviteStatusBadge } from "../invite-status-badge";

export function PendingInviteRow({ invite }: { invite: PendingInvite }) {
  const resendInvite = useResendInvite();

  return (
    <tr className="border-b border-n-100 last:border-0">
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-ink">{invite.email}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">
        {personaLabel(invite.persona)}
        {invite.school_admin_role && <span className="text-n-400"> · {invite.school_admin_role.name}</span>}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">
        <InviteStatusBadge status={invite.status} />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">{formatDateTime(invite.created_at)}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-n-500">{formatDateTime(invite.expires_at)}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary"
          disabled={invite.status === "accepted" || invite.status === "invalidated" || resendInvite.isPending}
          onClick={() => resendInvite.mutate(invite.id)}
        >
          {resendInvite.isPending ? "Resending…" : "Resend"}
        </Button>
      </td>
    </tr>
  );
}
