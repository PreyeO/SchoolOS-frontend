"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ArmPicker } from "@/components/shared/arm-picker";
import { ErrorState } from "@/components/shared/error-state";
import { TermPicker } from "@/components/shared/term-picker";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { buildArmOptions } from "@/lib/school/arm-options";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { useBroadsheet } from "../hooks/use-broadsheet";
import { NoStudentsRow, NoSubjectsRow } from "./broadsheet-empty";
import { BroadsheetNotices } from "./broadsheet-notices";
import { BroadsheetTable } from "./broadsheet-table";
import { NoTermsNotice } from "./no-terms-notice";
import { TermBadge } from "./term-badge";

// The one sheet a school actually runs a term on: every student down the side,
// every subject across the top. Open to teachers as well as admins (the
// backend gates it on CanViewResults) and readable before publishing — that's
// the point, since reviewing the grid is what happens *before* you lock.
//
// initialArmId/initialPeriodId are set by "View broadsheet" links elsewhere
// (Publish Results is the first) — the arm and term the caller was already
// looking at, rather than making them re-pick both. The arm seeds
// synchronously (no fetch needed, unlike fees' deep link); the term is applied
// once via effect, same as student-fees-page.tsx's own seeding.
export function BroadsheetPage({
  initialArmId,
  initialPeriodId,
}: {
  initialArmId?: string;
  initialPeriodId?: string;
} = {}) {
  // A picker, not the current term alone: reviewing a past term's broadsheet is
  // routine — it's what a school does when a parent queries last term's report.
  const term = useTermSelection();
  const { data: classes, isPending: classesLoading, isError, error } = useClasses();
  const [armId, setArmId] = useState<string | null>(initialArmId ?? null);

  useEffect(() => {
    if (initialPeriodId) term.setPeriodId(initialPeriodId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- consume once on mount
  }, []);

  const groups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const selectedId = armId ?? allOptions[0]?.armId ?? null;
  const selected = allOptions.find((o) => o.armId === selectedId) ?? null;

  const sheet = useBroadsheet(selectedId, term.periodId);

  if (term.isPending || classesLoading) {
    return <p className="text-sm text-n-400" role="status">Loading classes…</p>;
  }

  if (isError) {
    return <ErrorState error={error} resourceLabel="your classes" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Broadsheet</h1>
          <p className="mt-1 text-sm text-n-500">
            The whole class on one sheet — every student, every subject, for the term.
          </p>
        </div>
        {term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />}
      </div>

      {!term.hasTerms ? (
        <NoTermsNotice consequence="there's no broadsheet to show" />
      ) : allOptions.length === 0 ? (
        <p className="text-sm text-n-400 italic">No classes yet.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <ArmPicker groups={groups} value={selectedId} onChange={setArmId} label="Class" />
              <TermPicker
                groups={term.groups}
                value={term.periodId}
                onChange={term.setPeriodId}
                label="Term"
              />
            </div>
            {sheet.rows.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-8 shrink-0 text-xs"
              >
                <Printer className="size-3.5 mr-1" />
                Print
              </Button>
            )}
          </div>

          {!sheet.isPending && (
            <BroadsheetNotices
              isLocked={sheet.isLocked}
              missingScores={sheet.missingScores}
              emptyColumns={sheet.emptyColumns}
            />
          )}

          <div className="rounded-xl border border-n-200 bg-white" data-print-area>
            {/* The picker/badge sit outside the print area, so this is the only
                clue on the printed sheet of which class and term it is. */}
            <p className="hidden print:block print:mb-3 print:text-base print:font-semibold">
              {selected?.label} — {term.label}
            </p>

            {sheet.isPending ? (
              <p className="p-5 text-sm text-n-400" role="status">Loading broadsheet…</p>
            ) : sheet.isError ? (
              <div className="p-5">
                <ErrorState error={sheet.error} resourceLabel="this broadsheet" />
              </div>
            ) : sheet.rows.length === 0 ? (
              <NoStudentsRow
                armLabel={selected?.label ?? "this class"}
                termLabel={term.label ?? "this term"}
              />
            ) : sheet.columns.length === 0 ? (
              <NoSubjectsRow armLabel={selected?.label ?? "This class"} />
            ) : (
              <BroadsheetTable columns={sheet.columns} rows={sheet.rows} />
            )}
          </div>

          {!sheet.isPending && sheet.rows.length > 0 && (
            <p className="text-xs text-n-400">
              {sheet.rows.length} student{sheet.rows.length === 1 ? "" : "s"} ·{" "}
              {sheet.columns.length} subject{sheet.columns.length === 1 ? "" : "s"}
              {sheet.isLocked && " · published"}
            </p>
          )}
        </>
      )}
    </div>
  );
}
