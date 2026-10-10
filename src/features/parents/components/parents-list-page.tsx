"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { inviteHref } from "@/features/invitations/lib/invite-persona-param";

import { useParents } from "../hooks/use-parents";
import type { ParentFilters as Filters } from "../types";
import { ParentFilters } from "./parent-filters";
import { ParentsTable } from "./parents-table";

const PAGE_SIZE = 25;

export type ParentsView = "current" | "former";

export function ParentsListPage({ initialView = "current" }: { initialView?: ParentsView }) {
  const [view, setView] = useState<ParentsView>(initialView);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);
  const former = view === "former";

  const filters: Filters = {
    page,
    ...(state ? { state } : {}),
    // Former parents: is_parent=false. And no is_active filter — offboarding
    // someone whose only role was parent deactivates their membership, so
    // the default "active only" would hide most of this list.
    ...(former ? { is_parent: false } : showInactive ? {} : { is_active: true }),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  };

  const { data, isPending, isError, error } = useParents(filters);

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Parents & Guardians</h1>
          <p className="mt-1 text-sm text-n-500">
            {former
              ? "Parents who were offboarded. Their links to children are kept as history."
              : "Parent and guardian accounts and their linked children."}
          </p>
        </div>
        <Button type="button" asChild>
          <Link href={inviteHref("parent")}>Invite parent</Link>
        </Button>
      </div>

      <div role="tablist" aria-label="Which parents" className="inline-flex rounded-lg border border-n-200 bg-white p-0.5">
        {(["current", "former"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => { setView(v); resetPage(); }}
            className={`cursor-pointer rounded-md px-3 py-1 text-sm ${view === v ? "bg-primary text-primary-foreground" : "text-n-500 hover:text-ink"}`}
          >
            {v === "current" ? "Current" : "Former"}
          </button>
        ))}
      </div>

      <ParentFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); resetPage(); }}
        state={state}
        onStateChange={(v) => { setState(v); resetPage(); }}
        showInactive={showInactive}
        onShowInactiveChange={former ? undefined : (v) => { setShowInactive(v); resetPage(); }}
      />

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading parents…</p>
      ) : isError || !data ? (
        <ErrorState error={error} resourceLabel="parents" />
      ) : (
        <>
          <ParentsTable parents={data.results} />
          <PaginationControls page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
