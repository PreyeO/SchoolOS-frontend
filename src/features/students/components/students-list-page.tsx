"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

import { useStudents } from "../hooks/use-students";
import type { EnrollmentStatus, Gender, StudentFilters } from "../types";
import { StudentFilters as StudentFiltersBar } from "./student-filters";
import { StudentsTable } from "./students-table";

const PAGE_SIZE = 25;

export function StudentsListPage() {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<Gender | "all">("all");
  const [status, setStatus] = useState<EnrollmentStatus | "all">("all");
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const filters: StudentFilters = {
    page,
    ...(gender !== "all" ? { gender } : {}),
    ...(status !== "all" ? { enrollment_status: status } : {}),
    ...(showInactive ? {} : { is_active: true }),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  };

  const { data, isPending, isError } = useStudents(filters);

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Students</h1>
          <p className="mt-1 text-sm text-n-500">Every student enrolled at your school.</p>
        </div>
        <Button type="button" asChild>
          <Link href="/invitations">Add student</Link>
        </Button>
      </div>

      <StudentFiltersBar
        search={search}
        onSearchChange={(v) => { setSearch(v); resetPage(); }}
        gender={gender}
        onGenderChange={(v) => { setGender(v); resetPage(); }}
        status={status}
        onStatusChange={(v) => { setStatus(v); resetPage(); }}
        showInactive={showInactive}
        onShowInactiveChange={(v) => { setShowInactive(v); resetPage(); }}
      />

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading students…</p>
      ) : isError || !data ? (
        <p className="text-sm text-clay" role="alert">Couldn&rsquo;t load students. Please refresh.</p>
      ) : (
        <>
          <StudentsTable students={data.results} />
          <PaginationControls page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
