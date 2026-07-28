"use client";

import { useState } from "react";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { usePendingInvites } from "../../hooks/use-pending-invites";
import type { InvitePersona, InviteStatus, PendingInvitesFilters as Filters } from "../../types";
import { PendingInvitesFilters } from "./pending-invites-filters";
import { PendingInvitesTable } from "./pending-invites-table";

export function PendingInvitesPanel() {
  const [status, setStatus] = useState<InviteStatus | "all">("all");
  const [persona, setPersona] = useState<InvitePersona | "all">("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const filters: Filters = {
    ...(status !== "all" ? { status } : {}),
    ...(persona !== "all" ? { persona } : {}),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  };

  const { data: invites, isPending, isError } = usePendingInvites(filters);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Pending invites</h2>
        <p className="mt-1 text-sm text-n-500">Track invites you&rsquo;ve sent and resend any that have expired.</p>
      </div>

      <PendingInvitesFilters
        status={status}
        onStatusChange={setStatus}
        persona={persona}
        onPersonaChange={setPersona}
        search={search}
        onSearchChange={setSearch}
      />

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading invites…</p>
      ) : isError || !invites ? (
        <p className="text-sm text-clay" role="alert">Couldn&rsquo;t load invites. Please refresh.</p>
      ) : (
        <PendingInvitesTable invites={invites} />
      )}
    </div>
  );
}
