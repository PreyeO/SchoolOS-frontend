"use client";

import { useState } from "react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Select } from "@/components/ui/select";

import { useReplaceableCardIds, useScratchCards } from "../hooks/use-scratch-card-queries";
import type { ScratchCard, ScratchCardFilters } from "../types";
import { CardsList, CardsTableView, canOfferReplace } from "./cards-views";
import { ReplaceCardDialog } from "./replace-card-dialog";
import { useSessionFilter } from "./session-filter";

// Server filters only. Replaced cards show under "All" only: there's no
// server filter for them, and filtering one page client-side would make the
// page counts lie. "In stock" is the server's `unused`: cards issuance can
// still hand out, which excludes cards already issued but not yet used.
const VIEWS: Record<string, { label: string; filters: ScratchCardFilters }> = {
  all: { label: "All cards", filters: {} },
  stock: { label: "In stock", filters: { unused: true } },
  used: { label: "Used", filters: { is_bound: true } },
  locked: { label: "Locked", filters: { is_locked: true } },
};

export function CardsTable() {
  const [view, setView] = useState("all");
  const [page, setPage] = useState(1);
  // A snapshot of the card being replaced, outside the rows: the refetch after
  // a print replace turns that row "Replaced", and the dialog must outlive it.
  const [replacing, setReplacing] = useState<ScratchCard | null>(null);
  // Stock is per session (unused=true with academic_session_id is the
  // handoff's definition, and what issuance can take), so every view is scoped
  // to one session unless "All sessions" is picked.
  const session = useSessionFilter("cards");
  const { data, isPending, isError } = useScratchCards({
    ...VIEWS[view].filters,
    ...(session.sessionId && { academic_session_id: session.sessionId }),
    page,
  });
  // Replace needs an active assignment. In stock means none, by definition,
  // so that view skips the lookups; elsewhere only plausible cards are asked.
  const candidates = view === "stock" ? [] : (data?.results ?? []).filter(canOfferReplace).map((c) => c.id);
  const replaceable = useReplaceableCardIds(candidates);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        {session.control(() => setPage(1))}
        <Select
          aria-label="Show cards"
          value={view}
          onChange={(e) => {
            setView(e.target.value);
            setPage(1);
          }}
          className="h-9 w-full sm:w-48"
        >
          {Object.entries(VIEWS).map(([key, v]) => (
            <option key={key} value={key}>{v.label}</option>
          ))}
        </Select>
      </div>
      {view === "stock" && session.isAll && (
        <p className="text-xs text-n-500">
          Showing stock from every session. Cards are issued one session at a time, so pick a session to see what
          you can issue.
        </p>
      )}

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading cards…</p>
      ) : isError ? (
        <p className="text-sm text-clay">Couldn&rsquo;t load cards. Refresh to try again.</p>
      ) : data.results.length === 0 ? (
        <p className="text-sm text-n-400 italic">
          {view === "all"
            ? "You haven't bought any cards yet. Buy cards above; they appear here once the payment goes through."
            : view === "stock"
              ? "No cards left to issue. Buy more above."
              : "No cards match this filter."}
        </p>
      ) : (
        <>
          <div className="sm:hidden">
            <CardsList cards={data.results} replaceable={replaceable} onReplace={setReplacing} />
          </div>
          <div className="hidden sm:block">
            <CardsTableView cards={data.results} replaceable={replaceable} onReplace={setReplacing} />
          </div>
          <PaginationControls page={page} pageSize={25} count={data.count} onPageChange={setPage} />
        </>
      )}
      <ReplaceCardDialog key={replacing?.id ?? "closed"} card={replacing} onClose={() => setReplacing(null)} />
    </div>
  );
}
