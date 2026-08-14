"use client";

import Link from "next/link";
import { ArrowRight, LayoutGrid, MailCheck, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CLASS_TEACHER_TYPES, type TeacherType } from "@/features/staff/types";

interface Props {
  name: string;
  email: string;
  teacherType: TeacherType;
  onInviteAnother: () => void;
}

// Shown in place of the form after a successful invite. A toast would say the
// same thing and then vanish — the part worth keeping on screen is that
// acceptance gates everything else, which is the non-obvious bit: a teacher's
// membership stays inactive until they accept, so they can't be put in charge of
// a class or given subjects before then.
//
// The next steps are filtered by the type just chosen. Listing both regardless
// read as though the type had been ignored, and worse, offered a subject-only
// teacher a form-teacher role the backend refuses outright (CLASS_TEACHER_TYPES).
export function TeacherInvitedResult({ name, email, teacherType, onInviteAnother }: Props) {
  const canLeadClass = CLASS_TEACHER_TYPES.includes(teacherType);
  // Any teacher may hold a subject assignment as far as the backend is
  // concerned, but suggesting it to someone declared form-teacher-only is noise
  // — it stays available on Teaching Assignments if they change their mind.
  const takesSubjects = teacherType !== "class";

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-grass/30 bg-grass/10 px-3.5 py-3">
        <MailCheck className="mt-0.5 size-4 shrink-0 text-grass" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">Invite sent to {name}</p>
          <p className="mt-0.5 wrap-break-word text-sm text-n-600">{email}</p>
        </div>
      </div>

      <div className="rounded-lg border border-n-200 p-4">
        <p className="text-sm text-ink">
          They&rsquo;ll appear in your teacher list once they accept.{" "}
          {canLeadClass && takesSubjects ? "After that you can:" : "After that:"}
        </p>
        <ul className="mt-3 space-y-2">
          {canLeadClass && (
            <li>
              <Link
                href="/classes"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <LayoutGrid className="size-3.5 shrink-0" />
                Put them in charge of a class
                <ArrowRight className="size-3 shrink-0" />
              </Link>
              {/* Spells out the difference between the type and the assignment.
                  Without this, an admin who just picked "Form teacher" reads the
                  link as a repeat of the choice they already made. */}
              <p className="ml-5.5 mt-0.5 text-xs text-n-400">
                The type you picked says they can lead one — this is where you choose
                which. Its register can&rsquo;t be marked until you do.
              </p>
            </li>
          )}
          {takesSubjects && (
            <li>
              <Link
                href="/teaching-assignments"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <UsersRound className="size-3.5 shrink-0" />
                Assign their subjects
                <ArrowRight className="size-3 shrink-0" />
              </Link>
              <p className="ml-5.5 mt-0.5 text-xs text-n-400">
                Needed before they can enter scores for a subject.
              </p>
            </li>
          )}
        </ul>
      </div>

      <Button type="button" variant="outline" onClick={onInviteAnother} className="w-full">
        Invite another teacher
      </Button>
    </div>
  );
}
