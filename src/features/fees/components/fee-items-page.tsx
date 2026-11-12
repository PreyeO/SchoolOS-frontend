"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { Button } from "@/components/ui/button";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { useTermSelection } from "@/lib/school/use-term-selection";
import { buildClassOptions } from "@/lib/school/class-options";

import { useCreateFeeItem } from "../hooks/use-fee-item-mutations";
import { useFeeItems } from "../hooks/use-fee-items";
import { CopyFeesDialog } from "./copy-fees-dialog";
import { FeeItemDialog } from "./fee-item-dialog";
import { FeeItemsBlockers } from "./fee-items-blockers";
import { FeeItemsContextBar } from "./fee-items-context-bar";
import { FeeItemsEmpty } from "./fee-items-empty";
import { FeeItemsTable } from "./fee-items-table";

// What a class is charged for one term.
//
// Fees are per class rather than per level or per arm: SS3 carries a WAEC fee
// SS1 doesn't, while SS3 A and SS3 B are billed identically. There is no fee
// structure entity wrapping these — a class's termly total is simply the sum of
// its active lines, which is why the table foots itself.
export function FeeItemsPage() {
  const {
    data: classes,
    isPending: classesLoading,
    isPaused: classesPaused,
    isError: classesError,
    error: classesErr,
  } = useClasses();
  const term = useTermSelection();
  const canEdit = useHasSchoolPermission("edit_fees");

  const [classId, setClassId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const classGroups = useMemo(() => buildClassOptions(classes ?? []), [classes]);
  const classOptions = useMemo(() => classGroups.flatMap((g) => g.options), [classGroups]);

  // Both default rather than lock: setting next term's fees before it opens is
  // half of this screen's job.
  const selectedClass = classId ?? classOptions[0]?.classId ?? null;

  const items = useFeeItems(selectedClass, term.periodId);
  const createItem = useCreateFeeItem();

  const inactiveCount = (items.data ?? []).filter((i) => !i.is_active).length;
  const visible = (items.data ?? []).filter((i) => showInactive || i.is_active);

  // Names the exact class and term a write will land on. The dialog has no
  // picker for either, and a fee created against the wrong term is invisible —
  // nobody's balance moves and nothing errors.
  const className = classOptions.find((o) => o.classId === selectedClass)?.label ?? "";
  const termName = term.label ?? "";
  const context = className && termName ? `${className} · ${termName}` : "";

  // Offline with nothing cached: `isPaused && !data`, since a *disabled* query
  // is also pending. Fee queries are never persisted (see PERSISTED_KEYS).
  if ((classesPaused && !classes) || (term.isPaused && !term.hasTerms)) {
    return <OfflineNotice resourceLabel="Your fee structure" />;
  }
  if (classesLoading || term.isPending) {
    return <p className="text-sm text-n-400" role="status">Loading classes…</p>;
  }
  if (classesError) {
    return <ErrorState error={classesErr} resourceLabel="your classes" />;
  }

  const ready = classOptions.length > 0 && term.hasTerms;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Fee Structure</h1>
          <p className="mt-1 text-sm text-n-500">
            What each class is charged, term by term. Every student in a class is billed these
            automatically unless a fee is waived for them.
          </p>
        </div>
        {ready && canEdit && (
          <span className="flex flex-wrap gap-2">
          <CopyFeesDialog
            lines={(items.data ?? []).filter((i) => i.is_active).map((i) => ({ name: i.name, amount: i.amount }))}
            sourceClassId={selectedClass as string}
            sourceLabel={className}
            termLabel={termName}
            periodId={term.periodId as string}
            classGroups={classGroups}
          />
          <FeeItemDialog
            trigger={
              <Button type="button" size="sm">
                <Plus className="size-4 mr-1" /> Add fee
              </Button>
            }
            title="Add a fee"
            context={context}
            submitLabel="Add"
            isPending={createItem.isPending}
            onSave={(values) =>
              createItem.mutateAsync({
                klass_id: selectedClass as string,
                academic_period_id: term.periodId as string,
                ...values,
              })
            }
          />
          </span>
        )}
      </div>

      <FeeItemsBlockers hasClasses={classOptions.length > 0} hasTerms={term.hasTerms} />

      {ready && (
        <>
          <FeeItemsContextBar
            classGroups={classGroups}
            classId={selectedClass}
            onClassChange={setClassId}
            termGroups={term.groups}
            periodId={term.periodId}
            onPeriodChange={term.setPeriodId}
            showInactive={showInactive}
            onShowInactiveChange={setShowInactive}
            inactiveCount={inactiveCount}
          />

          {items.isPaused && !items.data ? (
            <OfflineNotice resourceLabel="This class's fees" />
          ) : items.isPending ? (
            <p className="text-sm text-n-400" role="status">Loading fees…</p>
          ) : items.isError ? (
            <ErrorState error={items.error} resourceLabel="this class's fees" />
          ) : visible.length === 0 ? (
            <FeeItemsEmpty context={context} canEdit={canEdit} hasHidden={inactiveCount > 0} />
          ) : (
            <FeeItemsTable items={visible} context={context} canEdit={canEdit} />
          )}
        </>
      )}
    </div>
  );
}
