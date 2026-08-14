"use client";

import Link from "next/link";
import { ArrowRight, LayoutGrid, MailCheck, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  name: string;
  email: string;
  onInviteAnother: () => void;
}

// Shown in place of the form after a successful invite. A toast would say the
// same thing and then vanish — the part worth keeping on screen is that
// acceptance gates everything else, which is the non-obvious bit: a teacher's
// membership stays inactive until they accept, so they can't be made a form
// teacher or given subjects before then.
export function TeacherInvitedResult({ name, email, onInviteAnother }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-grass/30 bg-grass/10 px-3.5 py-3">
        <MailCheck className="mt-0.5 size-4 shrink-0 text-grass" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">Invite sent to {name}</p>
          <p className="mt-0.5 break-words text-sm text-n-600">{email}</p>
        </div>
      </div>

      <div className="rounded-lg border border-n-200 p-4">
        <p className="text-sm text-ink">
          They&rsquo;ll appear in your teacher list once they accept. After that you can:
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <Link
              href="/classes"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <LayoutGrid className="size-3.5 shrink-0" />
              Make them a form teacher
              <ArrowRight className="size-3 shrink-0" />
            </Link>
            <p className="ml-5.5 mt-0.5 text-xs text-n-400">
              Needed before anyone can mark that class&rsquo;s register.
            </p>
          </li>
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
        </ul>
      </div>

      <Button type="button" variant="outline" onClick={onInviteAnother} className="w-full">
        Invite another teacher
      </Button>
    </div>
  );
}
