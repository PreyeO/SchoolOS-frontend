"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { OfflineNotice } from "@/components/shared/offline-notice";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { TermPicker } from "@/components/shared/term-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentLedger } from "@/features/fees/hooks/use-student-ledger";
import { NoTermsNotice } from "@/features/results/components/no-terms-notice";
import { TermBadge } from "@/features/results/components/term-badge";
import { useReportCard } from "@/features/results/hooks/use-report-card";
import { isPermissionDeniedError } from "@/lib/api/get-error-message";
import { armDisplayName } from "@/lib/school/arm-display-name";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { useParentChild } from "../hooks/use-parent-child";
import { ChildFeesTab } from "./child-fees-tab";
import { ChildResultsTab } from "./child-results-tab";
import { ChildSnapshot } from "./child-snapshot";

// One child, one term: how they're doing and what's owed.
//
// The header reads from /me and the ledger, never GET /api/students/<id>/ —
// that endpoint is gated on CanViewStudents (admin with view_students, or any
// teacher), so a parent 403s on it even for their own child. The ledger's
// nested StudentListItem carries the photo and current class instead.
//
// Both queries share their keys with the tabs below and with the home screen's
// useChildrenOverview, so this renders from cache when opened from a card and
// issues one request per resource, not three.
export function ChildDetailPage({ studentId }: { studentId: string }) {
  const { child, isPending } = useParentChild(studentId);
  const term = useTermSelection();
  const ledger = useStudentLedger(studentId, term.periodId);
  const reportCard = useReportCard(studentId, term.periodId);

  if (isPending || term.isPending) {
    return <p className="text-sm text-n-400" role="status">Loading…</p>;
  }

  // Not an error state: a parent reaching an id that isn't theirs has almost
  // certainly followed a stale link, and both endpoints would refuse it anyway.
  // Saying so plainly beats a permission error.
  if (!child) {
    return (
      <div className="space-y-4">
        <BackLink />
        <p className="rounded-xl border border-n-200 bg-white p-6 text-center text-sm text-n-500">
          We couldn&rsquo;t find that child on your account.
        </p>
      </div>
    );
  }

  const student = ledger.data?.student;
  const klass = student?.current_class;
  const klassLabel = klass
    ? armDisplayName({ name: klass.arm_name, is_default: klass.is_default }, klass.class_name)
    : null;

  return (
    <div className="space-y-5">
      <BackLink />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <PersonAvatar
            firstName={student?.user.first_name ?? child.student_name}
            lastName={student?.user.last_name ?? ""}
            photo={student?.user.photo}
            className="size-14 shrink-0"
          />
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-bold text-ink">
              {child.student_name}
            </h1>
            <p className="mt-0.5 truncate text-sm text-n-500">
              {klassLabel && <>{klassLabel} · </>}
              <span className="font-mono text-xs">{child.admission_number}</span>
              <span className="capitalize"> · Your {child.relationship}</span>
            </p>
          </div>
        </div>
        {term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />}
      </div>

      {term.isPaused && !term.hasTerms ? (
        <OfflineNotice resourceLabel="Results and fees" />
      ) : !term.hasTerms ? (
        <NoTermsNotice consequence="there are no results or fees to show yet" />
      ) : (
        <>
          <ChildSnapshot
            ledger={ledger.data}
            reportCard={reportCard.data}
            awaitingResults={isPermissionDeniedError(reportCard.error)}
          />

          <TermPicker
            groups={term.groups}
            value={term.periodId}
            onChange={term.setPeriodId}
            label="Term"
          />

          <Tabs defaultValue="results">
            <TabsList>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              <ChildResultsTab
                studentId={studentId}
                periodId={term.periodId}
                termLabel={term.label ?? "This term"}
              />
            </TabsContent>

            <TabsContent value="fees">
              <ChildFeesTab
                studentId={studentId}
                studentName={child.student_name}
                periodId={term.periodId}
                termLabel={term.label ?? "this term"}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/my-children"
      className="inline-flex items-center gap-1.5 text-sm text-n-500 hover:text-ink"
    >
      <ArrowLeft className="size-4" /> Back to my children
    </Link>
  );
}
