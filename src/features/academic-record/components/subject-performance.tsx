"use client";

import type { StudentSubjectResult } from "@/features/results/types";
import { ordinal } from "@/lib/text/ordinal";

// Below this is a fail on every grading scale this app ships defaults for
// (data/grading-defaults.ts — WAEC's F9 and the simpler A–F alike).
const PASS_MARK = 40;

// Where a child is strong and where they need help.
//
// A meter list rather than a plotted chart, and that's the considered choice: a
// senior arm can offer a dozen subjects, and past ~7 categories a chart's
// colour classes blur into each other while its axis labels fight for room. A
// sorted list of tracks stays exact at any subject count, keeps every subject
// name fully readable, and needs no legend.
//
// One hue for the fill — this is magnitude, not identity, so a palette of
// per-subject colours would encode nothing. The single exception is a genuine
// status: a failing score takes the clay status colour AND says "Below pass" in
// text, never colour alone.
export function SubjectPerformance({ subjects }: { subjects: StudentSubjectResult[] }) {
  const rows = [...subjects].sort((a, b) => Number(b.total_score) - Number(a.total_score));

  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-n-400 italic">
        No subject results for this term.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {rows.map((subject) => {
        const score = Number(subject.total_score);
        const failing = score < PASS_MARK;

        return (
          <li key={subject.id}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-sm text-ink">{subject.subject_name}</p>
              <p className="shrink-0 text-sm tabular-nums text-n-500">
                {subject.grade && <span className="text-ink">{subject.grade}</span>}
                {subject.grade && " · "}
                <span className="font-medium text-ink">{score}</span>
                <span className="text-n-400">/100</span>
              </p>
            </div>

            <div
              className="mt-1 h-1.5 overflow-hidden rounded-full bg-n-100"
              role="img"
              aria-label={`${subject.subject_name}: ${score} out of 100${
                subject.grade ? `, grade ${subject.grade}` : ""
              }${failing ? ", below pass mark" : ""}`}
            >
              <div
                className={`h-full rounded-full ${failing ? "bg-clay" : "bg-primary"}`}
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </div>

            {/* Position and the fail flag both sit here so neither depends on
                colour to be read. */}
            {(failing || subject.subject_position_in_arm !== null) && (
              <p className="mt-1 flex flex-wrap gap-x-2 text-[11px]">
                {failing && <span className="font-medium text-clay">Below pass</span>}
                {subject.subject_position_in_arm !== null && (
                  <span className="text-n-400">
                    {ordinal(subject.subject_position_in_arm)} in class
                  </span>
                )}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
