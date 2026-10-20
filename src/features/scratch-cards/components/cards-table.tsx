"use client";

import { useState } from "react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Select } from "@/components/ui/select";

import { useScratchCards } from "../hooks/use-scratch-card-queries";
import type { ScratchCard, ScratchCardFilters } from "../types";
import { CardsList, CardsTableView } from "./cards-views";
import { RegenerateCardDialog } from "./regenerate-card-dialog";

// The two filters the backend has. Replaced cards show under "All" only:
// there's no server filter for them, and filtering one page client-side would
// make the page counts lie.
const VIEWS: Record<string, { label: string; filters: ScratchCardFilters }> = {
  all: { label: "All cards", filters: {} },
  unused: { label: "Unused", filters: { is_bound: false } },
  used: { label: "Used", filters: { is_bound: true } },
  locked: { label: "Locked", filters: { is_locked: true } },
};

export function CardsTable() {
  const [view, setView] = useState("all");
  const [page, setPage] = useState(1);
  // A snapshot of the card being replaced, outside the rows: the refetch after
  // a regenerate turns that row "Replaced", and the dialog must outlive it.
  const [replacing, setReplacing] = useState<ScratchCard | null>(null);
  const { data, isPending, isError } = useScratchCards({ ...VIEWS[view].filters, page });

  return (
    <div className="space-y-3">
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

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading cards…</p>
      ) : isError ? (
        <p className="text-sm text-clay">Couldn&rsquo;t load cards. Refresh to try again.</p>
      ) : data.results.length === 0 ? (
        <p className="text-sm text-n-400 italic">
          {view === "all"
            ? "You haven't bought any cards yet. Buy cards above; they appear here once the payment goes through."
            : "No cards match this filter."}
        </p>
      ) : (
        <>
          <div className="sm:hidden">
            <CardsList cards={data.results} onRegenerate={setReplacing} />
          </div>
          <div className="hidden sm:block">
            <CardsTableView cards={data.results} onRegenerate={setReplacing} />
          </div>
          <PaginationControls page={page} pageSize={25} count={data.count} onPageChange={setPage} />
        </>
      )}
      <RegenerateCardDialog card={replacing} onClose={() => setReplacing(null)} />
    </div>
  );
}
