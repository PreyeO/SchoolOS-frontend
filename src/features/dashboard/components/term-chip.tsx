"use client";

import Link from "next/link";
import { CalendarRange, CalendarX } from "lucide-react";

import { useCanAccess } from "@/lib/auth/use-can-access";
import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";
import { useSchoolStore } from "@/stores/school-store";

export function TermChip() {
  const school = useSchoolStore((s) => s.currentSchool);
  // The store holds null both for "no term is current" and for "we haven't
  // looked yet", and those must not read the same. Sharing the query key with
  // useSyncSchoolData means this reads the same cache entry rather than
  // fetching again — it only needs to know whether the answer has arrived.
  //
  // Without this the chip announced "No current term" on every fresh boot,
  // which became permanent-looking after a subdomain hand-off, where the store
  // starts empty and the school loads before the sessions do.
  const { isPending: termUnknown } = useAcademicSessions();
  // Sessions & Terms is admin-only, so for a teacher this is a statement of
  // fact rather than something they can act on — the same warning, without a
  // link that would refuse them.
  const canFixTerm = useCanAccess("/settings/sessions");

  // Nothing to say before a school is loaded, or before the term is known.
  // Silence is right for both: a chip that flashes a warning and then corrects
  // itself teaches people to distrust it.
  if (!school || termUnknown) return null;

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
