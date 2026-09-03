"use client";

import { useState } from "react";
import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { usePendingInvites } from "../../hooks/use-pending-invites";
import type { InvitePersona, InviteStatus, PendingInvitesFilters as Filters } from "../../types";
import { PendingInvitesFilters } from "./pending-invites-filters";
import { PendingInvitesTable } from "./pending-invites-table";

// Matches the backend's default page size, which this screen does not override
// — same arrangement as the Staff/Student/Parent directories.
const PAGE_SIZE = 25;

export function PendingInvitesPanel() {
  const [status, setStatus] = useState<InviteStatus | "all">("all");
  const [persona, setPersona] = useState<InvitePersona | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const filters: Filters = {
    page,
    ...(status !== "all" ? { status } : {}),
    ...(persona !== "all" ? { persona } : {}),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  };

  const { data, isPending, isError, error } = usePendingInvites(filters);

  // Every filter change resets to page 1. Narrowing a filter while on page 3
  // can leave fewer pages than that, and the request would come back empty on a
  // list that isn't — reading as "no invites" rather than "no page 3".
  function resetPage() {
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Pending invites</h2>
        <p className="mt-1 text-sm text-n-500">
          Track invites you&rsquo;ve sent and resend any that have expired.
        </p>
        {/* Said up front rather than left to be discovered. Adding a student
            creates the account immediately with a password — there's no email to
            accept and nothing to resend — so students never appear here, and
            looking for one reads as a bug. */}
        <p className="mt-1.5 text-xs text-n-400">
          Admins, teachers and parents only. Students are created straight away with a
          password instead of being emailed an invite, so they appear in{" "}
          <Link href="/students" className="text-primary hover:underline">
            Students
          </Link>{" "}
          rather than here.
        </p>
      </div>

      <PendingInvitesFilters
        status={status}
        onStatusChange={(v) => { setStatus(v); resetPage(); }}
        persona={persona}
        onPersonaChange={(v) => { setPersona(v); resetPage(); }}
        search={search}
        onSearchChange={(v) => { setSearch(v); resetPage(); }}
      />

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading invites…</p>
      ) : isError || !data ? (
        <ErrorState error={error} resourceLabel="invites" />
      ) : (
        <>
          <PendingInvitesTable invites={data.results} />
          <PaginationControls page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
