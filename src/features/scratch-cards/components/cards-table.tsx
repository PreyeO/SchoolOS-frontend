"use client";

import { useState } from "react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useScratchCards } from "../hooks/use-scratch-card-queries";
import { CARD_STATUS_META, cardStatus } from "../lib/card-status";
import type { ScratchCard, ScratchCardFilters } from "../types";
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
          <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
                  <th className="px-3 py-2.5 font-medium">Serial</th>
                  <th className="px-3 py-2.5 font-medium">Session</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Student</th>
                  <th className="px-3 py-2.5 font-medium">Last used</th>
                  <th className="px-3 py-2.5"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((card) => {
                  const status = cardStatus(card);
                  const meta = CARD_STATUS_META[status];
                  return (
                    <tr key={card.id} className="border-b border-n-100 last:border-0 text-sm">
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-ink">{card.serial}</td>
                      <td className="px-3 py-2.5 text-n-500">{card.academic_session_name}</td>
                      <td className="px-3 py-2.5">
                        <span title={meta.hint} className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.className}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-ink">
                        {card.student ? (
                          <>
                            {card.student.user.first_name} {card.student.user.last_name}{" "}
                            <span className="font-mono text-xs text-n-400">{card.student.admission_number}</span>
                          </>
                        ) : (
                          <span className="text-n-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-n-500">
                        {card.last_used_at ? formatTimestamp(card.last_used_at) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {status !== "replaced" && (
                          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setReplacing(card)}>
                            <RefreshCw className="size-3.5" /> Regenerate
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginationControls page={page} pageSize={25} count={data.count} onPageChange={setPage} />
        </>
      )}
      <RegenerateCardDialog card={replacing} onClose={() => setReplacing(null)} />
    </div>
  );
}
