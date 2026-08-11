"use client";

import { useQueries } from "@tanstack/react-query";

import { getAttendance } from "@/features/attendance/api/attendance-api";
import type { AttendanceRecord } from "@/features/attendance/types";

import { useMyClasses } from "./use-my-classes";

// Local calendar date, not toISOString() — that converts to UTC and returns
// yesterday for anyone opening the app before ~1am WAT.
export function todayLocal(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export interface RegisterStatus {
  classArmId: string;
  label: string;
  subjects: string[];
  isFormClass: boolean;
  markedToday: boolean;
  presentToday: number;
  totalToday: number;
}

export interface TrendPoint {
  date: string;
  label: string;
  rate: number;
  present: number;
  total: number;
}

export interface AbsenceEntry {
  studentId: string;
  name: string;
  admissionNumber: string;
  className: string;
  absences: number;
}

// "Late" still means the student was there. Counting it as an absence would
// overstate absence rates in schools that mark lateness diligently.
const PRESENT_STATUSES = new Set(["present", "late"]);

// How many marked days the trend covers. Not calendar days — a school week has
// gaps, and plotting unmarked days as zero would invent absences.
const TREND_DAYS = 10;
const MAX_AT_RISK = 5;

function buildTrend(records: AttendanceRecord[]): TrendPoint[] {
  const byDate = new Map<string, { present: number; total: number }>();
  records.forEach((r) => {
    const bucket = byDate.get(r.date) ?? { present: 0, total: 0 };
    bucket.total += 1;
    if (PRESENT_STATUSES.has(r.status)) bucket.present += 1;
    byDate.set(r.date, bucket);
  });

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-TREND_DAYS)
    .map(([date, { present, total }]) => ({
      date,
      label: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
      present,
      total,
    }));
}

function buildAtRisk(records: AttendanceRecord[]): AbsenceEntry[] {
  const tally = new Map<string, AbsenceEntry>();
  records
    .filter((r) => r.status === "absent")
    .forEach((r) => {
      const existing = tally.get(r.student.id);
      if (existing) {
        existing.absences += 1;
        return;
      }
      tally.set(r.student.id, {
        studentId: r.student.id,
        name: `${r.student.user.first_name} ${r.student.user.last_name}`,
        admissionNumber: r.student.admission_number,
        className: r.student.current_class?.arm_name ?? r.student.current_class?.class_name ?? "",
        absences: 1,
      });
    });
  return [...tally.values()].sort((a, b) => b.absences - a.absences).slice(0, MAX_AT_RISK);
}

// Roster size = the headcount on the most recent marked day. Only knowable once
// a register exists, because the student directory itself is admin-only.
function rosterSize(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;
  const latest = records.reduce((max, r) => (r.date > max ? r.date : max), records[0].date);
  return records.filter((r) => r.date === latest).length;
}

// Everything the teacher home shows, derived from attendance records.
//
// Attendance is the one dataset a teacher is allowed to read — the student
// directory is admin-only — and its records nest full student details, so the
// rosters, counts, trend and at-risk list all come from here rather than from
// /api/students/, which would 403.
//
// Deliberately not memoised: `results` is a fresh array every render, so any
// dependency list built from it would invalidate anyway, and these are linear
// passes over a few hundred rows.
export function useTeacherOverview() {
  const { classes, isPending: classesLoading, isError, error } = useMyClasses();
  const today = todayLocal();

  // One request per arm the teacher touches — bounded by their own teaching
  // load, which is a handful of arms rather than a school-sized list.
  const results = useQueries({
    queries: classes.map((klass) => ({
      queryKey: ["attendance", "arm-history", klass.classArmId],
      queryFn: () => getAttendance(klass.classArmId),
    })),
  });

  const isPending = classesLoading || results.some((r) => r.isPending);
  const recordsByArm = results.map((r) => r.data ?? []);
  const allRecords = recordsByArm.flat();

  const registers: RegisterStatus[] = classes.map((klass, i) => {
    const todays = recordsByArm[i].filter((r) => r.date === today);
    return {
      classArmId: klass.classArmId,
      label: klass.label,
      subjects: klass.subjects,
      isFormClass: klass.isFormClass,
      markedToday: todays.length > 0,
      presentToday: todays.filter((r) => PRESENT_STATUSES.has(r.status)).length,
      totalToday: todays.length,
    };
  });

  const trend = buildTrend(allRecords);

  return {
    isPending,
    // Surfaced rather than swallowed: a failed load leaves `classes` empty,
    // which is indistinguishable from a teacher who genuinely has none. Showing
    // "no classes assigned" for a 500 sends them to an admin over nothing.
    isError,
    error,
    classes,
    registers,
    trend,
    studentCount: recordsByArm.reduce((sum, records) => sum + rosterSize(records), 0),
    subjectCount: new Set(classes.flatMap((c) => c.subjects)).size,
    needsAttention: buildAtRisk(allRecords),
    latestRate: trend.length > 0 ? trend[trend.length - 1].rate : null,
    unmarkedToday: registers.filter((r) => !r.markedToday).length,
    hasAnyRecords: allRecords.length > 0,
  };
}
