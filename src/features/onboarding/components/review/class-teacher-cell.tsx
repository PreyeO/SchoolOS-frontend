"use client";

import { TriangleAlert, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ClassArmRecord } from "@/lib/school/class-record";

import { AssignClassTeacherDialog } from "./assign-class-teacher-dialog";

interface Props {
  arm: ClassArmRecord;
  // What to call this arm in the dialog. Defaults to the arm's own name; a class
  // whose only arm is the system placeholder passes the class name instead.
  label?: string;
}

// The teacher cell IS the control — clicking it opens assign/change/remove.
// Deliberately not a name plus a row of edit icons: an arm already carries
// rename and delete pencils, and a second pencil beside them for "change
// teacher" is indistinguishable from "rename arm" at icon size.
export function ClassTeacherCell({ arm, label }: Props) {
  const teacher = arm.class_teacher;

  return (
    <AssignClassTeacherDialog
      arm={arm}
      label={label}
      trigger={
        <button
          type="button"
          aria-label={
            teacher
              ? `Form teacher for ${label ?? arm.name}: ${teacher.name}. Change or remove.`
              : `Assign a form teacher for ${label ?? arm.name}`
          }
          className={cn(
            "inline-flex min-w-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
            teacher
              ? "border-n-200 text-ink hover:border-n-300 hover:bg-n-50"
              : // Unassigned is a blocking state, not a neutral empty one: without a
                // form teacher nobody can mark this arm's register at all. Tinted
                // fill rather than amber text, which fails contrast at this size.
                "border-amber/40 bg-amber/10 text-ink hover:bg-amber/20",
          )}
        >
          {teacher ? (
            <>
              <UserRound className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{teacher.name}</span>
            </>
          ) : (
            <>
              <TriangleAlert className="size-3.5 shrink-0 text-amber" />
              <span>No form teacher</span>
            </>
          )}
        </button>
      }
    />
  );
}
