"use client";

import Link from "next/link";
import { ArrowRight, School } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { useMe } from "@/features/me/hooks/use-me";
import { greeting } from "@/lib/text/greeting";
import { useSchoolStore } from "@/stores/school-store";

import { useTeacherOverview } from "../hooks/use-teacher-overview";
import { AttendanceTrendCard } from "./attendance-trend-card";
import { MyResultsCard } from "./my-results-card";
import { NeedsAttentionList } from "./needs-attention-list";
import { RegisterStatusList } from "./register-status-list";
import { OfflineActions } from "./offline-actions";
import { TeacherStatTiles } from "./teacher-stat-tiles";

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

export function TeacherHome() {
  const school = useSchoolStore((s) => s.currentSchool);
  // Already in cache — useTeacherOverview reaches /me through useMyClasses — so
  // this costs nothing extra.
  const { data: me } = useMe();
  const firstName = me?.user.first_name;
  const {
    isPending,
    unavailableOffline,
    isError,
    error,
    classes,
    registers,
    trend,
    studentCount,
    hasRoster,
    subjectCount,
    needsAttention,
    latestRate,
    unmarkedToday,
    hasAnyRecords,
  } = useTeacherOverview();

  const term = school?.currentTermName
    ? `${school.currentTermName} · ${school.sessionName}`
    : school?.sessionName;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {/* Falls back to the bare greeting rather than showing a comma with
              nothing after it while /me is still in flight. */}
          <h1 className="font-display text-2xl font-bold text-ink">
            {firstName ? `${greeting()}, ${firstName}` : greeting()}
          </h1>
          <p className="mt-1 text-sm text-n-500">
            {todayLabel()}
            {term && <span className="text-n-400"> · {term}</span>}
          </p>
        </div>
        {/* Gated on `registers`, not `classes`: for a subject-only teacher the
            list is empty, and "All registers marked today" would be a cheerful
            lie about work that was never theirs. */}
        {!isPending && registers.length > 0 && (
          <p className="text-sm text-n-500">
            {unmarkedToday === 0 ? (
              <span className="text-ink">All registers marked today.</span>
            ) : (
              <>
                <span className="font-medium text-ink">{unmarkedToday}</span>{" "}
                {unmarkedToday === 1 ? "register" : "registers"} still to take
              </>
            )}
          </p>
        )}
      </div>

      <OfflineActions />

      {unavailableOffline ? (
        <OfflineNotice resourceLabel="Your classes" />
      ) : isPending ? (
        <p className="text-sm text-n-400" role="status">Loading your classes…</p>
      ) : isError ? (
        <ErrorState error={error} resourceLabel="your classes" />
      ) : classes.length === 0 ? (
        <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
            <School className="size-5 text-n-400" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">No classes assigned yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
            Once an administrator assigns you to subjects, your classes, registers and
            attendance figures will appear here.
          </p>
        </div>
      ) : (
        <>
          <TeacherStatTiles
            classCount={classes.length}
            subjectCount={subjectCount}
            studentCount={studentCount}
            hasRoster={hasRoster}
            latestRate={latestRate}
          />

          <div className="grid gap-4 lg:grid-cols-5">
            <section className="rounded-xl border border-n-200 bg-white p-5 lg:col-span-3">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-base font-semibold text-ink">Today&rsquo;s registers</h2>
                {/* Same gate as the "still to take" line above: registers, not
                    classes. A subject-only teacher has no register of their
                    own to take, so the button that invites them to isn't
                    shown either — RegisterStatusList's own empty state below
                    already explains why. */}
                {registers.length > 0 && (
                  <Button type="button" size="sm" asChild>
                    <Link href="/attendance">
                      Take register <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-xs text-n-400">{todayLabel()}</p>
              <div className="mt-2">
                <RegisterStatusList registers={registers} />
              </div>
            </section>

            {/* Results take the second slot beside today's registers. Score
                entry, submission and corrections are half a teacher's term and
                had no presence on this screen at all, while attendance had
                three of the four blocks. The trend keeps its place below —
                it's real, measured data, unlike the admin charts, so it's
                demoted rather than dropped. */}
            <MyResultsCard />
          </div>

          <AttendanceTrendCard trend={trend} hasAnyRecords={hasAnyRecords} />

          {needsAttention.length > 0 && <NeedsAttentionList entries={needsAttention} />}
        </>
      )}
    </div>
  );
}
