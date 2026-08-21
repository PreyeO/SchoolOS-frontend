"use client";

import Link from "next/link";
import { CalendarRange, CalendarX } from "lucide-react";

import { useCanAccess } from "@/lib/auth/use-can-access";
import { useSchoolStore } from "@/stores/school-store";

export function TermChip() {
  const school = useSchoolStore((s) => s.currentSchool);
  // Sessions & Terms is admin-only, so for a teacher this is a statement of
  // fact rather than something they can act on — the same warning, without a
  // link that would refuse them.
  const canFixTerm = useCanAccess("/settings/sessions");

  // Nothing to say before a school is loaded at all.
  if (!school) return null;

  // No period marked current. This isn't cosmetic: enrolling a student and
  // inviting one both fail outright with "No current academic session is set for
  // this school" until an admin marks one, so the shell says so up front.
  if (!school.sessionName) {
    const warning = (
      <>
        <CalendarX className="size-3.5" />
        <span className="hidden sm:inline">No current term</span>
        <span className="sm:hidden">No term</span>
      </>
    );
    const chipClass =
      "flex items-center gap-1.5 rounded-full border border-clay/30 bg-clay/10 px-3 py-1 text-xs font-medium text-clay";

    return canFixTerm ? (
      <Link href="/settings/sessions" className={`${chipClass} transition-colors hover:bg-clay/20`}>
        {warning}
      </Link>
    ) : (
      <span className={chipClass} title="An administrator needs to mark the current term.">
        {warning}
      </span>
    );
  }

  const label = school.currentTermName
    ? `${school.currentTermName} · ${school.sessionName}`
    : school.sessionName;

  // The healthy chip is pure information. For a teacher it stays exactly that —
  // no link, since the screen behind it isn't theirs to open.
  if (!canFixTerm) {
    return (
      <span
        className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground/70 md:flex"
        title="Current academic session"
      >
        <CalendarRange className="size-3.5 text-primary" />
        {label}
      </span>
    );
  }

  return (
    <Link
      href="/settings/sessions"
      className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground/70 transition-colors hover:bg-muted md:flex"
      title="Current academic session"
    >
      <CalendarRange className="size-3.5 text-primary" />
      {label}
    </Link>
  );
}
