"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { DEFAULT_GRADE_COMPONENTS, getDefaultGradeRanges } from "@/data/grading-defaults";
import { useSchoolLevels } from "@/lib/school/use-school-levels";

import { useGradingSystems } from "../hooks/use-grading-systems";
import { useCreateGradingSystem } from "../hooks/use-grading-mutations";
import { GradingFormDialog } from "./grading/grading-form-dialog";
import { GradingSystemCard } from "./grading/grading-system-card";

export function GradingPage() {
  const { data: systems, isPending, isError, error } = useGradingSystems();
  const { levels: schoolLevels } = useSchoolLevels();
  const createSystem = useCreateGradingSystem();

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading your grading systems…</p>;
  }

  if (isError || !systems) {
    return <ErrorState error={error} resourceLabel="your grading systems" />;
  }

  const configuredLevels = new Set(systems.map((s) => s.level));
  const availableLevels = schoolLevels.filter((l) => !configuredLevels.has(l));
  const firstAvailable = availableLevels[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Grading</h1>
          <p className="mt-1 text-sm text-n-500">
            Set up how scores are calculated and mapped to grades, one system per school level.
          </p>
        </div>
        {availableLevels.length > 0 && (
          <GradingFormDialog
            title="Add a grading system"
            initialValues={{
              level: "",
              name: "",
              components: DEFAULT_GRADE_COMPONENTS,
              ranges: firstAvailable ? getDefaultGradeRanges(firstAvailable) : [],
            }}
            availableLevels={availableLevels}
            isPending={createSystem.isPending}
            onSave={(values) =>
              createSystem.mutateAsync({
                level: values.level as (typeof availableLevels)[number],
                name: values.name,
                components: values.components.map((c, i) => ({ ...c, order: i + 1 })),
                ranges: values.ranges,
              })
            }
            trigger={
              <Button type="button">
                <Plus className="size-4 mr-1" /> Add grading system
              </Button>
            }
          />
        )}
      </div>

      {systems.length === 0 ? (
        <p className="text-sm text-n-400 italic">No grading systems yet.</p>
      ) : (
        <div className="space-y-4">
          {systems.map((system) => (
            <GradingSystemCard key={system.id} system={system} />
          ))}
        </div>
      )}
    </div>
  );
}
