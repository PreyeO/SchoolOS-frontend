"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { formatDate } from "@/lib/text/format-date";

import { usePlatformSchoolsPage } from "../hooks/use-platform";
import { AccessBadge } from "./access-badge";

const PAGE_SIZE = 25;

export function SchoolsListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebouncedValue(search, 300);
  const { data, isPending, isError, error } = usePlatformSchoolsPage(
    page,
    PAGE_SIZE,
    debounced || undefined,
  );
  const schools = data?.results;

  function changeSearch(next: string) {
    setSearch(next);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Schools</h1>
        <p className="mt-1 text-sm text-n-500">
          Every school on the platform. Open one to manage its access.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-n-400" />
        <Input
          value={search}
          onChange={(e) => changeSearch(e.target.value)}
          placeholder="Search schools…"
          className="pl-9"
          aria-label="Search schools"
        />
      </div>

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading schools…</p>
      ) : isError || !schools ? (
        <ErrorState error={error} resourceLabel="the school list" />
      ) : schools.length === 0 ? (
        <p className="rounded-xl border border-n-200 bg-white p-8 text-center text-sm text-n-400 italic">
          {debounced ? "No schools match that search." : "No schools yet."}
        </p>
      ) : (
        <>
        <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
                <th className="px-3 py-2.5 font-medium">School</th>
                <th className="px-3 py-2.5 font-medium">Type</th>
                <th className="px-3 py-2.5 font-medium">Location</th>
                <th className="px-3 py-2.5 font-medium">Joined</th>
                <th className="px-3 py-2.5 font-medium">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {schools.map((school) => (
                <tr key={school.id}>
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/platform/schools/${school.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {school.name}
                    </Link>
                    <span className="block truncate font-mono text-[11px] text-n-400">
                      {school.subdomain}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 capitalize text-n-500">
                    {school.school_type.replace(/_/g, " ")}
                  </td>
                  <td className="px-3 py-2.5 text-n-500">
                    {school.city}
                    {school.state && <span className="text-n-400">, {school.state}</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-n-500">
                    {formatDate(school.created_at.slice(0, 10))}
                  </td>
                  <td className="px-3 py-2.5">
                    <AccessBadge status={school.access_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
