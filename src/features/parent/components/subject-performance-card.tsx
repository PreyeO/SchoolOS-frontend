"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import type { ReportCard } from "@/features/results/types";

import { SubjectPerformance } from "./subject-performance";

interface Props {
  reportCard: ReportCard | undefined;
  awaitingResults: boolean;
  isPending: boolean;
  termLabel: string;
}

// The dashboard's subject block. Silent when there's nothing published — the
// Progress card above already explains the term's status, and repeating it here
// would give a parent the same non-news twice on one screen.
export function SubjectPerformanceCard({
  reportCard,
  awaitingResults,
  isPending,
  termLabel,
}: Props) {
  if (isPending || awaitingResults || !reportCard || reportCard.subjects.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-n-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <BookOpen className="size-4 text-n-400" />
          Subjects
        </h2>
        <Link
          href="/child/results"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Full result
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <p className="mt-0.5 text-xs text-n-500">{termLabel}</p>

      <div className="mt-3.5">
        <SubjectPerformance subjects={reportCard.subjects} />
      </div>
    </section>
  );
}
