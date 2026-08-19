"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Undo2 } from "lucide-react";

import { useClasses } from "@/features/settings/hooks/use-classes";
import { useResultsProgress } from "@/features/results/hooks/use-results-progress";
import { buildArmOptions } from "@/lib/school/arm-options";
import { cn } from "@/lib/utils";

// Where the term's results have got to, for the admin home.
//
// Readiness rather than performance. A grade spread or a school average only
// exists once classes are published, which is the last step — so a chart of it
// would be blank for most of the term and tells nobody what to do. What an
// owner actually asks at term end is "what's holding results up", and every
// figure here answers that with a link to the screen that fixes it.
export function ResultsProgressCard() {
  const { currentTerm, isPending, published, awaitingReview, sentBack, notSubmitted } =
    useResultsProgress();
  const { data: classes } = useClasses();

  // The real denominator. Arms with no broadsheet row yet don't appear in the
  // lock-state response at all, so counting only that would quietly shrink the
  // total as a term progresses.
  const totalArms = buildArmOptions(classes ?? []).flatMap((g) => g.options).length;

  if (!currentTerm) return null;

  const stats = [
    {
      label: "Awaiting your review",
      value: awaitingReview,
      href: "/results/review",
      icon: Clock,
      urgent: awaitingReview > 0,
    },
    {
      label: "Sent back, not resubmitted",
      value: sentBack,
      href: "/results/review",
      icon: Undo2,
      urgent: false,
    },
    {
      label: "Not submitted yet",
      value: notSubmitted,
      href: "/results/review",
      icon: Clock,
      urgent: false,
    },
  ];

  return (
    <section className="rounded-xl border border-n-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-base font-semibold text-ink">Results this term</h2>
          <p className="mt-0.5 text-xs text-n-400">{currentTerm.label}</p>
        </div>
        <Link
          href="/results/publish"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Publish results <ArrowRight className="size-3" />
        </Link>
      </div>

      {isPending ? (
        <p className="mt-4 text-sm text-n-400" role="status">Loading…</p>
      ) : (
        <>
          <p className="mt-3 flex items-center gap-2 text-sm text-ink">
            <CheckCircle2
              className={cn("size-4 shrink-0", published > 0 ? "text-grass" : "text-n-300")}
            />
            <span>
              <span className="font-medium">{published}</span>
              {totalArms > 0 && <> of {totalArms}</>} class
              {totalArms === 1 ? "" : "es"} published
            </span>
          </p>

          <ul className="mt-3 divide-y divide-n-100 border-t border-n-100">
            {stats.map((stat) => (
              <li key={stat.label}>
                <Link
                  href={stat.href}
                  className="flex items-center gap-2.5 py-2 transition-colors hover:text-ink"
                >
                  <stat.icon
                    className={cn("size-4 shrink-0", stat.urgent ? "text-amber" : "text-n-300")}
                  />
                  <span className="min-w-0 flex-1 text-sm text-n-500">{stat.label}</span>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      stat.urgent ? "text-amber" : "text-ink",
                    )}
                  >
                    {stat.value}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
