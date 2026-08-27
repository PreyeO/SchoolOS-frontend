"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { OfflineNotice } from "@/components/shared/offline-notice";
import { TermPicker } from "@/components/shared/term-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoTermsNotice } from "@/features/results/components/no-terms-notice";
import { TermBadge } from "@/features/results/components/term-badge";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { useParentChild } from "../hooks/use-parent-child";
import { ChildFeesTab } from "./child-fees-tab";
import { ChildResultsTab } from "./child-results-tab";

// One child, one term: what they scored and what they owe.
//
// The header reads from /me rather than the student record — GET
// /api/students/<id>/ is gated on CanViewStudents (admin with view_students, or
// any teacher), so a parent 403s on it even for their own child. Everything
// shown here is either already in the /me payload or comes from the two
// endpoints that do admit a linked parent.
export function ChildDetailPage({ studentId }: { studentId: string }) {
  const { child, isPending } = useParentChild(studentId);
  const term = useTermSelection();

  if (isPending || term.isPending) {
    return <p className="text-sm text-n-400" role="status">Loading…</p>;
  }

  // Not an error state: a parent reaching an id that isn't theirs has almost
  // certainly followed a stale link, and both endpoints below would refuse it
  // anyway. Saying so plainly beats a permission error.
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

  return (
    <div className="space-y-5">
      <BackLink />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-ink">{child.student_name}</h1>
          <p className="mt-1 font-mono text-xs text-n-400">{child.admission_number}</p>
        </div>
        {term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />}
      </div>

      {term.isPaused && !term.hasTerms ? (
        <OfflineNotice resourceLabel="Results and fees" />
      ) : !term.hasTerms ? (
        <NoTermsNotice consequence="there are no results or fees to show yet" />
      ) : (
        <>
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
