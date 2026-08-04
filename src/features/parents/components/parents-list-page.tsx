"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

import { useParents } from "../hooks/use-parents";
import type { ParentFilters as Filters } from "../types";
import { ParentFilters } from "./parent-filters";
import { ParentsTable } from "./parents-table";

const PAGE_SIZE = 25;

export function ParentsListPage() {
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const filters: Filters = {
    page,
    ...(state ? { state } : {}),
    ...(showInactive ? {} : { is_active: true }),
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
          <p className="mt-1 text-sm text-n-500">Parent and guardian accounts and their linked children.</p>
        </div>
        <Button type="button" asChild>
          <Link href="/invitations">Invite parent</Link>
        </Button>
      </div>

      <ParentFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); resetPage(); }}
        state={state}
        onStateChange={(v) => { setState(v); resetPage(); }}
        showInactive={showInactive}
        onShowInactiveChange={(v) => { setShowInactive(v); resetPage(); }}
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
