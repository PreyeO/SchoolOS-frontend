"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

import { useDemoRequests } from "../hooks/use-demo-requests";
import {
  DEMO_REQUEST_STATUSES,
  type DemoRequestFilters,
  type DemoRequestStatus,
} from "../types-demo-requests";
import { DemoRequestFilterBar } from "./demo-request-filters";
import { DemoRequestRow } from "./demo-request-row";

const STATUS_LABELS: Record<DemoRequestStatus, string> = {
  pending: "Pending",
  contacted: "Contacted",
  converted: "Converted",
  declined: "Declined",
};

export function DemoRequestsPage() {
  // Defaults to Pending, not All. This is a work queue — the useful first
  // question is "who haven't we called yet", not "everyone who ever asked".
  const [status, setStatus] = useState<DemoRequestStatus | "all">("pending");
  const [search, setSearch] = useState("");
  // Everything except status and search, which have their own controls.
  const [filters, setFilters] = useState<DemoRequestFilters>({});
  const debounced = useDebouncedValue(search, 300);

  const { data: requests, isPending, isError, error } = useDemoRequests({
    ...filters,
    search: debounced || undefined,
    status: status === "all" ? undefined : status,
  });

  const hasNarrowed = debounced.length > 0 || Object.values(filters).some(Boolean);

  function tabClass(active: boolean) {
    return cn(
      "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors",
      active
        ? "border-primary bg-primary/10 font-medium text-primary"
        : "border-n-200 text-n-500 hover:border-n-300",
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Demo requests</h1>
        <p className="mt-1 text-sm text-n-500">
          Schools that asked to join the pilot. Call or email them, then move the lead on.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setStatus("all")} className={tabClass(status === "all")}>
            All
          </button>
          {DEMO_REQUEST_STATUSES.map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)} className={tabClass(status === s)}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-n-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, school, email…"
            className="pl-9"
            aria-label="Search demo requests"
          />
        </div>
      </div>

      <DemoRequestFilterBar value={filters} onChange={setFilters} />

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading demo requests…</p>
      ) : isError ? (
        <ErrorState error={error} resourceLabel="the demo requests" />
      ) : requests.length === 0 ? (
        <p className="rounded-xl border border-n-200 bg-white p-8 text-center text-sm text-n-400 italic">
          {hasNarrowed
            ? "No demo requests match those filters."
            : status === "all"
              ? "No demo requests yet."
              : `Nothing ${STATUS_LABELS[status].toLowerCase()}.`}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
                <th className="px-3 py-2.5 font-medium">School</th>
                <th className="px-3 py-2.5 font-medium">Contact</th>
                <th className="px-3 py-2.5 font-medium">Reach them</th>
                <th className="px-3 py-2.5 font-medium">Students</th>
                <th className="px-3 py-2.5 font-medium">Received</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <DemoRequestRow key={r.id} request={r} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
