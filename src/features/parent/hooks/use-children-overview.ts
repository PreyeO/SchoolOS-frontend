"use client";

import { useQueries } from "@tanstack/react-query";

import { getStudentLedger } from "@/features/fees/api/ledger-api";
import { FEE_ITEMS_QUERY_KEY } from "@/features/fees/hooks/use-fee-items";
import type { StudentLedger } from "@/features/fees/types";
import { useMe } from "@/features/me/hooks/use-me";
import type { MeChildLink } from "@/features/me/types";
import { getReportCard } from "@/features/results/api/report-card-api";
import { REPORT_CARD_QUERY_KEY } from "@/features/results/hooks/use-report-card";
import type { ReportCard } from "@/features/results/types";
import { isPermissionDeniedError } from "@/lib/api/get-error-message";

export interface ChildOverview {
  link: MeChildLink;
  // Carries far more than the balance: StudentLedgerSerializer nests the full
  // StudentListItem, which is where the child's photo and current class come
  // from. /me's student_links have neither, so without this the cards can only
  // show a name — which is what made them feel empty.
  ledger: StudentLedger | undefined;
  reportCard: ReportCard | undefined;
  // A 403 on the report card is the ordinary pre-publish state, not a failure —
  // ResultsService.get_report_card refuses a parent until the arm's broadsheet
  // is locked. Distinguished here so a card can say "not published yet" rather
  // than rendering an error beside a perfectly good fee balance.
  awaitingResults: boolean;
  isPending: boolean;
}

// Every linked child's term at a glance: what they scored, what's owed.
//
// Two requests per child, bounded by how many children one parent has — a
// handful, not a school-sized list. Both use the SAME query keys as the child
// detail page's own hooks (useStudentLedger, useReportCard), so opening a child
// from here renders from cache instead of refetching what the home screen just
// loaded.
export function useChildrenOverview(periodId: string | null) {
  const { data: me, isPending: meLoading, isPaused, isError, error } = useMe();
  const children = me?.parent?.student_links ?? [];

  const ledgers = useQueries({
    queries: children.map((child) => ({
      queryKey: [FEE_ITEMS_QUERY_KEY, "ledger", child.student_id, periodId],
      queryFn: () => getStudentLedger(child.student_id, periodId as string),
      enabled: !!periodId,
    })),
  });

  const reportCards = useQueries({
    queries: children.map((child) => ({
      queryKey: [...REPORT_CARD_QUERY_KEY, child.student_id, periodId],
      queryFn: () => getReportCard(child.student_id, periodId as string),
      enabled: !!periodId,
      // Matches useReportCard: a pre-publish 403 won't resolve by asking again.
      retry: false,
    })),
  });

  const overviews: ChildOverview[] = children.map((link, i) => ({
    link,
    ledger: ledgers[i]?.data,
    reportCard: reportCards[i]?.data,
    awaitingResults: isPermissionDeniedError(reportCards[i]?.error),
    // A paused query never resolves, so excluding it keeps a card from spinning
    // forever offline — same reasoning as use-teacher-overview's per-arm gate.
    isPending:
      (ledgers[i]?.isPending && !ledgers[i]?.isPaused) ||
      (reportCards[i]?.isPending && !reportCards[i]?.isPaused),
  }));

  return {
    overviews,
    isPending: meLoading,
    // /me is the foundational query — without it there are no children to show.
    unavailableOffline: isPaused && !me,
    isError,
    error,
  };
}
