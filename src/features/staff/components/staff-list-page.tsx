"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { inviteHref } from "@/features/invitations/lib/invite-persona-param";

import { useTeachers } from "../hooks/use-teachers";
import type { TeacherFilters, TeacherType } from "../types";
import { StaffFilters } from "./staff-filters";
import { StaffTable } from "./staff-table";

const PAGE_SIZE = 25;

export function StaffListPage() {
  const [search, setSearch] = useState("");
  const [teacherType, setTeacherType] = useState<TeacherType | "all">("all");
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const filters: TeacherFilters = {
    page,
    ...(teacherType !== "all" ? { teacher_type: teacherType } : {}),
    ...(showInactive ? {} : { is_active: true }),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  };

  const { data, isPending, isError, error } = useTeachers(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Teachers</h1>
          <p className="mt-1 text-sm text-n-500">Teachers at your school, and their type.</p>
        </div>
        <Button type="button" asChild>
          <Link href={inviteHref("teacher")}>Invite teacher</Link>
        </Button>
      </div>

      <StaffFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        teacherType={teacherType}
        onTeacherTypeChange={(v) => { setTeacherType(v); setPage(1); }}
        showInactive={showInactive}
        onShowInactiveChange={(v) => { setShowInactive(v); setPage(1); }}
      />

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading teachers…</p>
      ) : isError || !data ? (
        <ErrorState error={error} resourceLabel="teachers" />
      ) : (
        <>
          <StaffTable teachers={data.results} />
          <PaginationControls page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
