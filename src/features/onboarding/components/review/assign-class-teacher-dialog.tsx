"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TeacherPicker } from "@/features/staff/components/teacher-picker";
import { useClassTeacherCandidates } from "@/features/staff/hooks/use-class-teacher-candidates";
import { teacherTypeLabel } from "@/features/staff/lib/teacher-type-label";
import type { ClassArmRecord } from "@/lib/school/class-record";

import { useAssignClassTeacher, useUnassignClassTeacher } from "../../hooks/use-class-teacher-mutations";

interface Props {
  arm: ClassArmRecord;
  trigger: React.ReactNode;
  // Display name for this arm in the dialog title. See ClassTeacherControl —
  // a class with only the system placeholder arm passes its class name.
  label?: string;
}

export function AssignClassTeacherDialog({ arm, trigger, label }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const assign = useAssignClassTeacher();
  const unassign = useUnassignClassTeacher();

  // Only fetch once the dialog is actually opened — this sits on every arm row,
  // and a class list can hold dozens of them.
  const { data: teachers, isPending, isError, error } = useClassTeacherCandidates(open);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setSelected(arm.class_teacher?.id ?? null);
  }

  async function submit() {
    if (!selected) return;
    try {
      await assign.mutateAsync({ armId: arm.id, teacherProfileId: selected });
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  // Removal lives here rather than as its own row control: it's the same
  // decision as assigning, just the empty case, and keeping it here means the
  // arm row needs one teacher affordance instead of three.
  async function remove() {
    try {
      await unassign.mutateAsync(arm.id);
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  const pending = assign.isPending || unassign.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Form teacher for {label ?? arm.name}</DialogTitle>
        </DialogHeader>

        <TeacherPicker
          teachers={teachers ?? []}
          isPending={isPending}
          isError={isError}
          error={error}
          selected={selected}
          onSelect={setSelected}
          className="max-h-64"
          renderSubLabel={(teacher) => {
            const leads = teacher.class_arms.filter((a) => a.id !== arm.id);
            return leads.length > 0
              ? `Already form teacher of ${leads.map((a) => a.name).join(", ")}`
              : teacher.user.email;
          }}
          emptyState={
            <div className="space-y-1">
              <p className="text-sm text-n-500">No teachers to choose from yet.</p>
              <p className="text-xs text-n-400">
                Only a teacher whose type is &ldquo;{teacherTypeLabel("class")}&rdquo; or
                &ldquo;{teacherTypeLabel("both")}&rdquo; can run a class. Invite one, or
                change an existing teacher&rsquo;s type.
              </p>
            </div>
          }
        />

        {arm.class_teacher && (
          <p className="text-xs text-n-400">
            Removing the form teacher leaves {label ?? arm.name} without one — nobody can
            mark its attendance until another is assigned.
          </p>
        )}

        <DialogFooter className="sm:justify-between">
          {arm.class_teacher ? (
            <Button
              type="button"
              variant="ghost"
              onClick={remove}
              disabled={pending}
              className="text-clay hover:bg-clay/10 hover:text-clay"
            >
              {unassign.isPending ? "Removing…" : "Remove form teacher"}
            </Button>
          ) : (
            <span />
          )}
          <span className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={submit}
              disabled={!selected || selected === arm.class_teacher?.id || pending}
            >
              {assign.isPending ? "Saving…" : arm.class_teacher ? "Change" : "Assign"}
            </Button>
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
