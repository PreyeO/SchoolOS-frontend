"use client";

import { useQueries } from "@tanstack/react-query";

import { getReportCard } from "@/features/results/api/report-card-api";
import { REPORT_CARD_QUERY_KEY } from "@/features/results/hooks/use-report-card";
import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";

export interface TermPoint {
  label: string;
  average: number;
  position: number | null;
}

// How a child's average has moved across the terms of one session.
//
// There is no trend endpoint — the report card is per-term — so this asks for
// each term in the session that contains `periodId` and keeps the ones that
// answered. Typically three requests, cached under the SAME keys useReportCard
// uses, so the results screen and this chart never fetch a term twice.
//
// Unpublished terms 403 (ResultsService.get_report_card refuses a parent until
// the arm's broadsheet is locked) and are dropped rather than plotted as zero —
// a term nobody has released is not a term the child scored nothing in. That
// also means the line can be shorter than the session, which the caller states
// rather than hides.
export function usePerformanceTrend(studentId: string | undefined, periodId: string | null) {
  const { data: sessions } = useAcademicSessions();

  // The session the selected term belongs to, so the trend follows the term
  // being viewed rather than always showing the newest year.
  const session = (sessions ?? []).find((s) => s.periods.some((p) => p.id === periodId));
  const periods = [...(session?.periods ?? [])].sort((a, b) => a.order - b.order);

  const results = useQueries({
    queries: periods.map((period) => ({
      queryKey: [...REPORT_CARD_QUERY_KEY, studentId, period.id],
      queryFn: () => getReportCard(studentId as string, period.id),
      enabled: !!studentId,
      retry: false,
    })),
  });

  const points: TermPoint[] = periods
    .map((period, i) => {
      const summary = results[i]?.data?.summary;
      if (!summary) return null;
      return {
        label: period.name,
        average: Number(summary.average_score),
        position: summary.position_in_arm,
      };
    })
    .filter((point): point is TermPoint => point !== null);

  return {
    points,
    sessionName: session?.name ?? null,
    termCount: periods.length,
    isPending: results.some((r) => r.isPending && !r.isPaused),
  };
}
