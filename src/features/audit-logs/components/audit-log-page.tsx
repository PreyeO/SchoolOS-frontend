"use client";

import { useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

import { useAuditLogs } from "../hooks/use-audit-logs";
import type { AuditLogFilters as Filters } from "../types";
import { AuditLogEmpty } from "./audit-log-empty";
import { AuditLogFilters } from "./audit-log-filters";
import { AuditLogSkeleton } from "./audit-log-skeleton";
import { AuditLogTimeline } from "./audit-log-timeline";

const PAGE_SIZE = 25;

export function AuditLogPage() {
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // action is a discrete pick from a dropdown now, not typed text, so it needs
  // no debounce — only the free-text actor search still does.
  const debouncedSearch = useDebouncedValue(search, 300);

  const filters: Filters = {
    page,
    ...(action ? { action } : {}),
    ...(dateFrom ? { created_at_after: dateFrom } : {}),
    ...(dateTo ? { created_at_before: dateTo } : {}),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  };

  const { data, isPending, isError, error } = useAuditLogs(filters);

  const isFiltered = !!action || !!dateFrom || !!dateTo || !!debouncedSearch.trim();

  function resetPage() {
    setPage(1);
  }

  function clearFilters() {
    setAction("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    resetPage();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Audit Log</h1>
        <p className="mt-1 text-sm text-n-500">
          A record of every change your team makes — who did it, what changed, and when.
        </p>
      </div>

      <AuditLogFilters
        action={action}
        onActionChange={(v) => { setAction(v); resetPage(); }}
        dateFrom={dateFrom}
        onDateFromChange={(v) => { setDateFrom(v); resetPage(); }}
        dateTo={dateTo}
        onDateToChange={(v) => { setDateTo(v); resetPage(); }}
        search={search}
        onSearchChange={(v) => { setSearch(v); resetPage(); }}
      />

      {isPending ? (
        <AuditLogSkeleton />
      ) : isError || !data ? (
        <ErrorState error={error} resourceLabel="the audit log" />
      ) : data.results.length === 0 ? (
        <AuditLogEmpty isFiltered={isFiltered} onClearFilters={clearFilters} />
      ) : (
        <>
          <AuditLogTimeline entries={data.results} />
          <PaginationControls page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
