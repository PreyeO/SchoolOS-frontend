"use client";

import { useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { AuditLogEmpty } from "@/features/audit-logs/components/audit-log-empty";
import { AuditLogFilters } from "@/features/audit-logs/components/audit-log-filters";
import { AuditLogSkeleton } from "@/features/audit-logs/components/audit-log-skeleton";
import { AuditLogTimeline } from "@/features/audit-logs/components/audit-log-timeline";
import { usePlatformAuditLogs } from "@/features/audit-logs/hooks/use-audit-logs";
import type { AuditLogFilters as Filters } from "@/features/audit-logs/types";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

const PAGE_SIZE = 25;

// The cross-school audit log.
//
// Every component here is the school-side screen's, reused unchanged — the
// filters, the 82-action catalog, the timeline, the skeleton and the empty
// state are all persona-free. Only two things differ: the hook drops the
// school gate, and the timeline is told to name each entry's school.
//
// There is no school FILTER: AuditLogFilters has no such parameter on the
// backend (action, actor search and date range only). Filtering by school
// would need a backend addition — see docs/asks.
export function PlatformAuditPage() {
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 300);

  const filters: Filters = {
    page,
    ...(action ? { action } : {}),
    ...(dateFrom ? { created_at_after: dateFrom } : {}),
    ...(dateTo ? { created_at_before: dateTo } : {}),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  };

  const { data, isPending, isError, error } = usePlatformAuditLogs(filters);
  const isFiltered = !!action || !!dateFrom || !!dateTo || !!debouncedSearch.trim();

  const resetPage = () => setPage(1);

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
          Every recorded change across every school — who did it, what changed, and when.
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
          <AuditLogTimeline entries={data.results} showSchool />
          <PaginationControls
            page={page}
            pageSize={PAGE_SIZE}
            count={data.count}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
