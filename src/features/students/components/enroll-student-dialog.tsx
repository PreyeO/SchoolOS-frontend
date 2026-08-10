"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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
import { ArmPicker } from "@/components/shared/arm-picker";
import { buildArmOptions } from "@/lib/school/arm-options";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useSchoolStore } from "@/stores/school-store";

import { useEnrollStudent } from "../hooks/use-enrollment";
import type { CurrentClass } from "../types";

interface Props {
  studentId: string;
  studentName: string;
  currentClass: CurrentClass | null;
  trigger: React.ReactNode;
}

export function EnrollStudentDialog({ studentId, studentName, currentClass, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [armId, setArmId] = useState("");
  const { data: classes, isPending: classesLoading } = useClasses();
  const sessionName = useSchoolStore((s) => s.currentSchool?.sessionName);
  const enroll = useEnrollStudent(studentId);

  const groups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const hasArms = groups.length > 0;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setArmId("");
  }

  async function submit() {
    if (!armId) return;
    try {
      await enroll.mutateAsync(armId);
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  const isTransfer = !!currentClass;
  // The backend rejects re-enrolling into the arm they're already in, so catch
  // it here rather than letting the admin submit into a guaranteed error.
  const sameArm = !!armId && armId === currentClass?.class_arm_id;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isTransfer ? `Move ${studentName}` : `Enrol ${studentName}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {isTransfer && (
            <p className="text-sm text-n-500">
              Currently in{" "}
              <span className="font-medium text-ink">
                {currentClass.arm_name || currentClass.class_name}
              </span>{" "}
              for {currentClass.session}.
            </p>
          )}

          {!sessionName ? (
            <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
              No academic term is marked current, so an enrolment can&rsquo;t be created.
              Set one in{" "}
              <Link href="/settings/sessions" className="text-primary hover:underline">
                Sessions &amp; Terms
              </Link>{" "}
              first.
            </p>
          ) : !classesLoading && !hasArms ? (
            <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
              No class has an arm to enrol into. Add one in{" "}
              <Link href="/classes" className="text-primary hover:underline">
                Classes &amp; Arms
              </Link>{" "}
              first.
            </p>
          ) : (
            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-ink">
                {isTransfer ? "Move to" : "Class"}
              </span>
              <ArmPicker
                id="enroll-class-arm"
                groups={groups}
                value={armId || null}
                onChange={setArmId}
                placeholder={classesLoading ? "Loading classes…" : "Select a class…"}
              />
              {sameArm && (
                <p className="text-xs text-clay">
                  They&rsquo;re already in this class for the current term.
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-n-400">
            {isTransfer
              ? "Their previous placement is kept in the enrolment history — nothing is overwritten."
              : "This places them for the current term only."}
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={submit}
            disabled={!armId || sameArm || !sessionName || !hasArms || enroll.isPending}
          >
            {enroll.isPending ? "Saving…" : isTransfer ? "Move" : "Enrol"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
