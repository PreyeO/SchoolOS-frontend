"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSchoolStore } from "@/stores/school-store";
import { useCompleteOnboarding } from "../hooks/use-complete-onboarding";

interface Props {
  onBack: () => void;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-n-100 last:border-0">
      <span className="text-sm text-n-500">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

export function StepReview({ onBack }: Props) {
  const school = useSchoolStore((s) => s.currentSchool);
  const setupStatus = useSchoolStore((s) => s.setupStatus);
  const { mutate, isPending } = useCompleteOnboarding();

  const completedSteps = Object.values(setupStatus).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl bg-grass/10 px-4 py-3 border border-grass/20">
        <CheckCircle2 className="size-5 text-grass shrink-0" />
        <p className="text-sm text-ink font-medium">
          {completedSteps} of 4 setup steps completed
        </p>
      </div>

      <div className="rounded-xl border border-n-200 px-4 divide-y divide-n-100">
        <ReviewRow label="School name" value={school?.name ?? "—"} />
        <ReviewRow label="School URL" value={school ? `${school.slug}.schoolos.com` : "—"} />
        <ReviewRow label="School type" value={school?.school_type ?? "—"} />
        <ReviewRow
          label="Academic year"
          value={setupStatus.academic_year ? (school?.sessionName ?? "Set up") : "Skipped"}
        />
        <ReviewRow
          label="Classes"
          value={
            setupStatus.classes
              ? `${school?.classCount ?? 0} class${school?.classCount !== 1 ? "es" : ""}`
              : "Skipped"
          }
        />
        <ReviewRow
          label="Subjects"
          value={
            setupStatus.subjects
              ? `${school?.subjectCount ?? 0} subject${school?.subjectCount !== 1 ? "s" : ""}`
              : "Skipped"
          }
        />
      </div>

      <p className="text-xs text-n-400">
        You can update all of these settings from your dashboard at any time.
      </p>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button
          type="button"
          disabled={isPending}
          onClick={() => mutate()}
          className="flex-1 bg-amber hover:bg-amber/90 text-ink font-semibold"
        >
          {isPending ? "Finishing up…" : "Go to dashboard"}
        </Button>
      </div>
    </div>
  );
}
