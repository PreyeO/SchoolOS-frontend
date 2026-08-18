"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ArmPicker } from "@/components/shared/arm-picker";
import { ErrorState } from "@/components/shared/error-state";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { buildArmOptions } from "@/lib/school/arm-options";

import { useBroadsheet } from "../hooks/use-broadsheet";
import { useScoreSheets } from "../hooks/use-score-sheets";
import { BroadsheetNotices } from "./broadsheet-notices";
import { BroadsheetTable } from "./broadsheet-table";
import { NoCurrentTermNotice } from "./no-current-term-notice";
import { TermBadge } from "./term-badge";

// The one sheet a school actually runs a term on: every student down the side,
// every subject across the top.
//
// Open to teachers as well as admins — the backend gates it on CanViewResults,
// which any teacher satisfies — and readable before publishing, which is the
// point. Reviewing the whole grid is what happens *before* you lock, so this is
// where the gaps show up rather than in the lock's refusal.
export function BroadsheetPage() {
  const { currentTerm, isPending: termLoading } = useScoreSheets();
  const { data: classes, isPending: classesLoading, isError, error } = useClasses();
  const [armId, setArmId] = useState<string | null>(null);

  const groups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const selectedId = armId ?? allOptions[0]?.armId ?? null;
  const selected = allOptions.find((o) => o.armId === selectedId) ?? null;

  const sheet = useBroadsheet(selectedId, currentTerm?.id);

  if (termLoading || classesLoading) {
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
        {currentTerm && <TermBadge label={currentTerm.label} />}
      </div>

      {!currentTerm ? (
        <NoCurrentTermNotice consequence="there's no broadsheet to show" />
      ) : allOptions.length === 0 ? (
        <p className="text-sm text-n-400 italic">No classes yet.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <ArmPicker groups={groups} value={selectedId} onChange={setArmId} label="Class" />
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
            {/* The picker and term badge sit outside the print area, so without
                this the printed sheet carries no clue which class or term. */}
            <p className="hidden print:block print:mb-3 print:text-base print:font-semibold">
              {selected?.label} — {currentTerm.label}
            </p>

            {sheet.isPending ? (
              <p className="p-5 text-sm text-n-400" role="status">Loading broadsheet…</p>
            ) : sheet.isError ? (
              <div className="p-5">
                <ErrorState error={sheet.error} resourceLabel="this broadsheet" />
              </div>
            ) : sheet.rows.length === 0 ? (
              <p className="p-5 text-sm text-n-400 italic">
                No students are enrolled in {selected?.label ?? "this class"} for this term.
              </p>
            ) : sheet.columns.length === 0 ? (
              <div className="p-5">
                <p className="text-sm font-medium text-ink">
                  {selected?.label ?? "This class"} takes no subjects yet
                </p>
                <p className="mt-1 text-sm text-n-500">
                  Add them in{" "}
                  <Link href="/teaching-assignments" className="text-primary hover:underline">
                    Teaching Assignments
                  </Link>{" "}
                  and scores can start going in.
                </p>
              </div>
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
