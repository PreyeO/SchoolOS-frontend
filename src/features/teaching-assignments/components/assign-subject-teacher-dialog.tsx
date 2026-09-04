"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeacherPicker } from "@/features/staff/components/teacher-picker";
import { useTeachers } from "@/features/staff/hooks/use-teachers";
import { teacherTypeLabel } from "@/features/staff/lib/teacher-type-label";
import type { SubjectResponse } from "@/features/onboarding/types";

import { useSubjectTeacherSelection } from "../hooks/use-subject-teacher-selection";
import type { SubjectAssignment } from "../types";
import { ExtraSubjectsStep } from "./extra-subjects-step";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classArmId: string;
  armLabel: string;
  subject: SubjectResponse;
  // Teachers already teaching this subject to this arm — excluded from the list,
  // since the backend rejects a duplicate (class_arm, subject, teacher) triple.
  alreadyAssignedIds: string[];
  // Every subject this arm offers, and every assignment already on it. Both are
  // needed for the bulk step: the first is what else a teacher could be given,
  // the second is what they already hold and so must not be sent again.
  armSubjects: SubjectResponse[];
  armAssignments: SubjectAssignment[];
}

// Controlled rather than trigger-based: the coverage table opens it for whichever
// subject row was clicked, so one dialog instance serves every row.
export function AssignSubjectTeacherDialog({
  open,
  onOpenChange,
  classArmId,
  armLabel,
  subject,
  alreadyAssignedIds,
  armSubjects,
  armAssignments,
}: Props) {
  const pick = useSubjectTeacherSelection({
    classArmId,
    subject,
    armSubjects,
    armAssignments,
    onDone: () => onOpenChange(false),
  });

  // Unlike class teacher, the backend puts no teacher_type restriction on
  // subject assignments — any teacher at the school can hold one.
  const { data: page, isPending, isError, error } = useTeachers({ is_active: true, page_size: 100 });

  const available = (page?.results ?? []).filter((t) => !alreadyAssignedIds.includes(t.id));
  const selectedTeacher = available.find((t) => t.id === pick.selected) ?? null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) pick.reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Who teaches {subject.name} to {armLabel}?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <TeacherPicker
            teachers={available}
            isPending={isPending}
            isError={isError}
            error={error}
            selected={pick.selected}
            onSelect={pick.pickTeacher}
            renderSubLabel={(t) =>
              `${teacherTypeLabel(t.teacher_type)}${t.specialization ? ` · ${t.specialization}` : ""}`
            }
            excludedFrom={page?.results}
            excludedReason={(t) =>
              `${t.user.first_name} ${t.user.last_name} is already assigned to teach ${subject.name} for ${armLabel}.`
            }
            emptyState={
              <p className="text-sm text-n-500">
                {alreadyAssignedIds.length > 0
                  ? "Every teacher is already assigned to this subject for this arm."
                  : "No active teachers yet."}
              </p>
            }
          />

          {selectedTeacher && pick.otherSubjects.length > 0 && (
            <ExtraSubjectsStep
              teacherFirstName={selectedTeacher.user.first_name}
              armLabel={armLabel}
              otherSubjects={pick.otherSubjects}
              heldByTeacher={pick.heldByTeacher}
              selected={pick.extras}
              onToggle={pick.toggleExtra}
              onToggleAll={pick.toggleAll}
            />
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={pick.submit}
            disabled={!pick.selected || pick.isSaving}
          >
            {pick.isSaving
              ? "Assigning…"
              : pick.total === 1
                ? "Assign"
                : `Assign ${pick.total} subjects`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
