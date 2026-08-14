"use client";

import { useState } from "react";
import { ArrowRight, GraduationCap, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useEnrollmentHistory } from "../hooks/use-enrollment";
import type { CurrentClass } from "../types";
import { EnrollStudentDialog } from "./enroll-student-dialog";
import { armDisplayName } from "@/lib/school/arm-display-name";

interface Props {
  studentId: string;
  studentName: string;
  currentClass: CurrentClass | null;
}

export function EnrollmentCard({ studentId, studentName, currentClass }: Props) {
  const [showHistory, setShowHistory] = useState(false);
  const { data: history, isPending } = useEnrollmentHistory(studentId);

  // The current placement is the newest row; the rest is where they've been.
  const past = (history ?? []).slice(1);

  return (
    <div className="rounded-xl border border-n-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">Class</h2>
          {currentClass ? (
            <p className="mt-1 text-sm text-ink">
              <span className="font-medium">
                {armDisplayName(currentClass.arm_name, currentClass.class_name)}
              </span>
              <span className="text-n-400"> · {currentClass.session}</span>
            </p>
          ) : (
            // Not cosmetic: with no enrolment they appear in no register, and
            // nothing downstream (attendance, results) can reference them.
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink">
              <TriangleAlert className="size-4 shrink-0 text-amber" />
              Not enrolled this term
            </p>
          )}
        </div>

        <EnrollStudentDialog
          studentId={studentId}
          studentName={studentName}
          currentClass={currentClass}
          trigger={
            <Button type="button" variant="outline" size="sm">
              {currentClass ? "Move class" : "Enrol"}
            </Button>
          }
        />
      </div>

      {!currentClass && (
        <p className="mt-2 text-xs text-n-500">
          They won&rsquo;t appear on any register until they&rsquo;re enrolled in a class arm.
        </p>
      )}

      {past.length > 0 && (
        <div className="mt-4 border-t border-n-100 pt-3">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            aria-expanded={showHistory}
            className="cursor-pointer text-xs font-medium text-primary hover:underline"
          >
            {showHistory ? "Hide" : `Show previous ${past.length === 1 ? "class" : "classes"}`}
          </button>

          {showHistory && (
            <ul className="mt-2.5 space-y-2">
              {past.map((row) => (
                <li key={row.id} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                  <GraduationCap className="size-3.5 shrink-0 self-center text-n-400" />
                  <span className="text-ink">{row.class_arm.name || row.class_name}</span>
                  <span className="text-n-400">{row.session}</span>
                  <span className="text-n-400">· {formatTimestamp(row.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isPending && <p className="mt-3 text-xs text-n-400" role="status">Loading history…</p>}

      {/* A transfer inserts a row rather than editing one, so the same session
          can legitimately appear twice — say so before it looks like a bug. */}
      {showHistory && past.length > 0 && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-n-400">
          <ArrowRight className="mt-0.5 size-3 shrink-0" />
          A term can appear more than once — each move is recorded rather than
          replacing the last.
        </p>
      )}
    </div>
  );
}
