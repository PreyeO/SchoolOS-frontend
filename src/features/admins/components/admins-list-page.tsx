"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

import { useAdmins } from "../hooks/use-admins";
import type { AdminFilters as Filters } from "../types";
import { AdminFilters } from "./admin-filters";
import { AdminsTable } from "./admins-table";

const PAGE_SIZE = 25;

export function AdminsListPage() {
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const filters: Filters = {
    page,
    ...(roleId ? { school_admin_role: roleId } : {}),
    ...(showInactive ? {} : { is_active: true }),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  };

  const { data, isPending, isError } = useAdmins(filters);

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">School Admins</h1>
          <p className="mt-1 text-sm text-n-500">Admin staff at your school and the role each one holds.</p>
        </div>
        <Button type="button" asChild>
          <Link href="/invitations">Invite admin</Link>
        </Button>
      </div>

      <AdminFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); resetPage(); }}
        roleId={roleId}
        onRoleIdChange={(v) => { setRoleId(v); resetPage(); }}
        showInactive={showInactive}
        onShowInactiveChange={(v) => { setShowInactive(v); resetPage(); }}
      />

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading admins…</p>
      ) : isError || !data ? (
        <p className="text-sm text-clay" role="alert">Couldn&rsquo;t load admins. Please refresh.</p>
      ) : (
        <>
          <AdminsTable admins={data.results} />
          <PaginationControls page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
