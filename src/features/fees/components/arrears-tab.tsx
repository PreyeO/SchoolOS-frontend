"use client";

import { useMemo, useState } from "react";
import { BadgeCheck } from "lucide-react";

import { ArmPicker } from "@/components/shared/arm-picker";
import { ErrorState } from "@/components/shared/error-state";
import { TermPicker } from "@/components/shared/term-picker";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { buildArmOptions } from "@/lib/school/arm-options";
import type { PeriodOptionGroup } from "@/lib/school/period-options";

import { useArmDefaulters } from "../hooks/use-arrears";
import { ArrearsTable } from "./arrears-table";

interface Props {
  termGroups: PeriodOptionGroup[];
  periodId: string | null;
  onPeriodChange: (id: string) => void;
  termName: string;
}

// One class arm's outstanding balances for a term.
//
// Arm-scoped, not class-scoped, even though fees are billed per class: the
// roster is current enrollment, and enrollment lives on the arm. So JSS 1 A and
// JSS 1 B are billed identically but chased separately, which is also how a
// school actually hands the list to a class teacher.
export function ArrearsTab({ termGroups, periodId, onPeriodChange, termName }: Props) {
  const { data: classes, isPending: classesLoading, isError, error } = useClasses();
  const [armId, setArmId] = useState<string | null>(null);

  const groups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const selectedArm = armId ?? allOptions[0]?.armId ?? null;

  const defaulters = useArmDefaulters(selectedArm, periodId);

  if (classesLoading) {
    return <p className="text-sm text-n-400" role="status">Loading classes…</p>;
  }
  if (isError) {
    return <ErrorState error={error} resourceLabel="your classes" />;
  }
  if (allOptions.length === 0) {
    return <p className="text-sm text-n-400 italic">No classes yet.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-xl border border-n-200 bg-white p-4">
        <ArmPicker groups={groups} value={selectedArm} onChange={setArmId} label="Class" />
        <TermPicker groups={termGroups} value={periodId} onChange={onPeriodChange} label="Term" />
      </div>

      {defaulters.isPending ? (
        <p className="text-sm text-n-400" role="status">Working out balances…</p>
      ) : defaulters.isError ? (
        <ErrorState error={defaulters.error} resourceLabel="this class's balances" />
      ) : defaulters.data.length === 0 ? (
        // An empty list means everyone is settled, never "no fees set" — the
        // endpoint only omits students whose balance is zero. Saying "no data"
        // here would read as a gap in the records rather than good news.
        <div className="rounded-xl border border-n-200 bg-white px-6 py-12 text-center">
          <BadgeCheck className="mx-auto size-6 text-grass" />
          <p className="mt-3 text-sm font-medium text-ink">Nobody owes anything</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-n-500">
            Every student in this class is fully paid up for {termName}, or has been waived.
          </p>
        </div>
      ) : (
        <ArrearsTable defaulters={defaulters.data} />
      )}
    </div>
  );
}
