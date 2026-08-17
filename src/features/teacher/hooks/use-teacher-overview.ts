"use client";

import { useQueries } from "@tanstack/react-query";

import { armDisplayName } from "@/lib/school/arm-display-name";
import { getAttendance, getRoster } from "@/features/attendance/api/attendance-api";
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
  // No `subjects`: the register list is one line per class and doesn't show
  // them. MyClass still carries them for My Classes and the subject-count tile.
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
        // current_class names the arm `arm_name`, not `name`.
        className: r.student.current_class
          ? armDisplayName(
              {
                name: r.student.current_class.arm_name,
                is_default: r.student.current_class.is_default,
              },
              r.student.current_class.class_name,
            )
          : "",
        absences: 1,
      });
    });
  return [...tally.values()].sort((a, b) => b.absences - a.absences).slice(0, MAX_AT_RISK);
}

// Roster size used to be inferred from the headcount on the most recent marked
// day, because the student directory was admin-only and a teacher had no other
// way to count their class. CanViewStudents changed that — list/retrieve now
// admit any teacher — so the roster is read directly and the count is right from
// the moment students are enrolled, with no register needed.

// Everything the teacher home shows.
//
// The trend and the at-risk list come from attendance records, which nest full
// student details. The headcount comes from the roster instead — a teacher can
// read that now (CanViewStudents), and it's the honest source: enrolment is what
// puts a student in a class, not whether anyone has marked them present yet.
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

  // Same query key the attendance page's useRoster uses, so opening a register
  // reuses what the dashboard already fetched rather than asking again.
  const rosters = useQueries({
    queries: classes.map((klass) => ({
      queryKey: ["attendance", "roster", klass.classArmId],
      queryFn: () => getRoster(klass.classArmId),
    })),
  });

  const isPending = classesLoading || results.some((r) => r.isPending);
  const recordsByArm = results.map((r) => r.data ?? []);
  const allRecords = recordsByArm.flat();

  // `total` rather than students.length: getRoster caps the page at 100 and
  // reports the real count separately, so a very large arm still totals right.
  const rostersLoaded = rosters.length === 0 || rosters.some((r) => r.data);
  const studentCount = rosters.reduce((sum, r) => sum + (r.data?.total ?? 0), 0);

  // Form classes only. The backend authorises *any* teacher to mark *any* arm
  // (AttendanceService._authorize_marker checks only that you're a teacher), but
  // the daily register belongs to the form teacher. Listing every arm someone
  // teaches a subject in manufactured an obligation they don't have, and left
  // two teachers both looking at the same register marked "Not marked".
  //
  // Mapped before filtering because the index is what pairs a class with its
  // fetched records — the queries are keyed off the unfiltered `classes` list,
  // which stays that way so the trend and headcount still span everything they
  // teach.
  const registers: RegisterStatus[] = classes
    .map((klass, i) => {
      const todays = recordsByArm[i].filter((r) => r.date === today);
      return {
        classArmId: klass.classArmId,
        label: klass.label,
        isFormClass: klass.isFormClass,
        markedToday: todays.length > 0,
        presentToday: todays.filter((r) => PRESENT_STATUSES.has(r.status)).length,
        totalToday: todays.length,
      };
    })
    .filter((register) => register.isFormClass);

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
    studentCount,
    // Whether the count can be trusted yet. Separate from hasAnyRecords, which
    // still gates the attendance-rate tile — that one genuinely does need a
    // register to exist.
    hasRoster: rostersLoaded,
    subjectCount: new Set(classes.flatMap((c) => c.subjects)).size,
    needsAttention: buildAtRisk(allRecords),
    latestRate: trend.length > 0 ? trend[trend.length - 1].rate : null,
    unmarkedToday: registers.filter((r) => !r.markedToday).length,
    hasAnyRecords: allRecords.length > 0,
  };
}
