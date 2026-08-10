"use client";

import Link from "next/link";
import { ArrowRight, School, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSchoolStore } from "@/stores/school-store";

import { useTeacherOverview } from "../hooks/use-teacher-overview";
import { AttendanceTrendChart } from "./attendance-trend-chart";
import { RegisterStatusList } from "./register-status-list";
import { TeacherStatTiles } from "./teacher-stat-tiles";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

export function TeacherHome() {
  const school = useSchoolStore((s) => s.currentSchool);
  const {
    isPending,
    classes,
    registers,
    trend,
    studentCount,
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
          <h1 className="font-display text-2xl font-bold text-ink">{greeting()}</h1>
          <p className="mt-1 text-sm text-n-500">
            {todayLabel()}
            {term && <span className="text-n-400"> · {term}</span>}
          </p>
        </div>
        {!isPending && classes.length > 0 && (
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

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading your classes…</p>
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
            latestRate={latestRate}
            hasAnyRecords={hasAnyRecords}
          />

          <div className="grid gap-4 lg:grid-cols-5">
            <section className="rounded-xl border border-n-200 bg-white p-5 lg:col-span-3">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-base font-semibold text-ink">Today&rsquo;s registers</h2>
                <Button type="button" size="sm" asChild>
                  <Link href="/attendance">
                    Take register <ArrowRight className="size-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-n-400">{todayLabel()}</p>
              <div className="mt-2">
                <RegisterStatusList registers={registers} />
              </div>
            </section>

            <section className="rounded-xl border border-n-200 bg-white p-5 lg:col-span-2">
              <h2 className="font-display text-base font-semibold text-ink">
                Attendance across your classes
              </h2>
              <p className="mt-0.5 text-xs text-n-400">
                {hasAnyRecords ? "Your last 10 marked days" : "Once you start marking registers"}
              </p>
              {trend.length > 1 ? (
                <div className="mt-3">
                  <AttendanceTrendChart data={trend} />
                </div>
              ) : (
                <div className="mt-6 grid place-items-center py-10 text-center">
                  <p className="max-w-60 text-sm text-n-400">
                    {trend.length === 1
                      ? "One day marked so far — the trend appears once there are two."
                      : "No registers taken yet. The trend builds as you mark them."}
                  </p>
                </div>
              )}
            </section>
          </div>

          {needsAttention.length > 0 && (
            <section className="rounded-xl border border-n-200 bg-white p-5">
              <h2 className="font-display text-base font-semibold text-ink">Needs attention</h2>
              <p className="mt-0.5 text-xs text-n-400">
                Most absences recorded in your classes
              </p>
              <ul className="mt-3 divide-y divide-n-100">
                {needsAttention.map((entry) => (
                  <li key={entry.studentId} className="flex items-center gap-3 py-2.5">
                    <TriangleAlert className="size-4 shrink-0 text-amber" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{entry.name}</span>
                      <span className="block truncate font-mono text-[11px] text-n-400">
                        {entry.admissionNumber}
                        {entry.className && ` · ${entry.className}`}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm text-n-600">
                      {entry.absences} {entry.absences === 1 ? "absence" : "absences"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
