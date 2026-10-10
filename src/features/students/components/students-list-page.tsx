"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { buildArmOptions } from "@/lib/school/arm-options";
import { inviteHref } from "@/features/invitations/lib/invite-persona-param";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { useSchoolStore } from "@/stores/school-store";

import { useStudentSelection } from "../hooks/use-student-selection";
import { useStudents } from "../hooks/use-students";
import type { EnrollmentStatus, Gender, StudentFilters } from "../types";
import { BulkStatusBar } from "./bulk-status-bar";
import { StudentFilters as StudentFiltersBar } from "./student-filters";
import { StudentsTable } from "./students-table";

const PAGE_SIZE = 25;

export function StudentsListPage() {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<Gender | "all">("all");
  const [status, setStatus] = useState<EnrollmentStatus | "all">("all");
  const [classArmId, setClassArmId] = useState<string | "all">("all");
  const [showInactive, setShowInactive] = useState(false);
  const [admittedAfter, setAdmittedAfter] = useState("");
  const [admittedBefore, setAdmittedBefore] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: classes } = useClasses();
  const armGroups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const sessionName = useSchoolStore((s) => s.currentSchool?.sessionName);

  const filters: StudentFilters = {
    page,
    ...(gender !== "all" ? { gender } : {}),
    ...(status !== "all" ? { enrollment_status: status } : {}),
    ...(classArmId !== "all" ? { class_arm_id: classArmId } : {}),
    ...(showInactive ? {} : { is_active: true }),
    // Either bound works alone — "admitted since September" is as useful a
    // question as a closed range.
    ...(admittedAfter ? { date_of_admission_after: admittedAfter } : {}),
    ...(admittedBefore ? { date_of_admission_before: admittedBefore } : {}),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  };

  const { data, isPending, isError, error } = useStudents(filters);
  // Bulk status change needs edit_students; without it there's no checkbox
  // column at all rather than one that leads to a 403.
  const canChangeStatus = useHasSchoolPermission("edit_students");
  const bulk = useStudentSelection();

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
          <Link href={inviteHref("student")}>Add student</Link>
        </Button>
      </div>

      <StudentFiltersBar
        search={search}
        onSearchChange={(v) => { setSearch(v); resetPage(); }}
        gender={gender}
        onGenderChange={(v) => { setGender(v); resetPage(); }}
        status={status}
        onStatusChange={(v) => { setStatus(v); resetPage(); }}
        armGroups={armGroups}
        classArmId={classArmId}
        onClassArmChange={(v) => { setClassArmId(v); resetPage(); }}
        showInactive={showInactive}
        onShowInactiveChange={(v) => { setShowInactive(v); resetPage(); }}
        admittedAfter={admittedAfter}
        onAdmittedAfterChange={(v) => { setAdmittedAfter(v); resetPage(); }}
        admittedBefore={admittedBefore}
        onAdmittedBeforeChange={(v) => { setAdmittedBefore(v); resetPage(); }}
      />

      {/* The class filter resolves against the current session, so with no term
          marked current it matches nobody — which reads as "this class is empty"
          rather than "the filter can't work yet". */}
      {classArmId !== "all" && !sessionName && (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
          No academic term is marked current, so filtering by class can&rsquo;t match
          anyone. Set one in{" "}
          <Link href="/settings/sessions" className="text-primary hover:underline">
            Sessions &amp; Terms
          </Link>
          .
        </p>
      )}

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading students…</p>
      ) : isError || !data ? (
        <ErrorState error={error} resourceLabel="students" />
      ) : (
        <>
          {canChangeStatus && bulk.count > 0 && <BulkStatusBar students={bulk.students} onClear={bulk.clear} />}
          <StudentsTable students={data.results} selection={canChangeStatus ? bulk.selection : undefined} />
          <PaginationControls page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
