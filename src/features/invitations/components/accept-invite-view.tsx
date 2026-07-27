"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/get-error-message";

import { useAcceptInvite } from "../hooks/use-accept-invite";
import { useInviteDetail } from "../hooks/use-invite-detail";
import { personaLabel } from "../lib/persona-label";
import type { AcceptInviteFormValues } from "../schemas/accept-invite-schema";
import { AcceptInviteForm } from "./accept-invite-form";

export function AcceptInviteView({ token }: { token: string }) {
  const { data: invite, isPending, isError, error } = useInviteDetail(token);
  const acceptInvite = useAcceptInvite();

  if (isPending) {
    return <p className="text-n-500" role="status">Checking your invite…</p>;
  }

  if (isError || !invite) {
    return (
      <div className="space-y-3">
        <h1 className="font-display text-2xl font-bold text-ink">This invite isn&rsquo;t valid</h1>
        <p className="text-n-500">{getErrorMessage(error)}</p>
        <Link href="/login" className="inline-block text-sm font-medium text-brand underline underline-offset-4">
          Go to login
        </Link>
      </div>
    );
  }

  function handleAccept(values?: AcceptInviteFormValues) {
    acceptInvite.mutate({ token, ...values });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Join {invite.school.name}</h1>
        <p className="mt-3 text-n-500 leading-relaxed">
          You&rsquo;ve been invited as a{" "}
          <span className="font-medium text-ink">{personaLabel(invite.persona)}</span> —{" "}
          <span className="font-medium text-ink">{invite.email}</span>.
        </p>
      </div>

      {invite.has_password ? (
        <Button
          type="button"
          disabled={acceptInvite.isPending}
          onClick={() => handleAccept()}
          className="w-full h-11 bg-amber hover:bg-amber/90 text-ink font-semibold text-base"
        >
          {acceptInvite.isPending ? "Joining…" : "Accept invite & continue"}
        </Button>
      ) : (
        <AcceptInviteForm isPending={acceptInvite.isPending} onSubmit={handleAccept} />
      )}
    </div>
  );
}
