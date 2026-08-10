"use client";

import Link from "next/link";
import { CalendarRange, CalendarX } from "lucide-react";

import { useSchoolStore } from "@/stores/school-store";

export function TermChip() {
  const school = useSchoolStore((s) => s.currentSchool);

  // Nothing to say before a school is loaded at all.
  if (!school) return null;

  // No period marked current. This isn't cosmetic: enrolling a student and
  // inviting one both fail outright with "No current academic session is set for
  // this school" until an admin marks one, so the shell says so up front and
  // links straight to where it's fixed.
  if (!school.sessionName) {
    return (
      <Link
        href="/settings/sessions"
        className="flex items-center gap-1.5 rounded-full border border-clay/30 bg-clay/10 px-3 py-1 text-xs font-medium text-clay transition-colors hover:bg-clay/20"
      >
        <CalendarX className="size-3.5" />
        <span className="hidden sm:inline">No current term</span>
        <span className="sm:hidden">No term</span>
      </Link>
    );
  }

  const label = school.currentTermName
    ? `${school.currentTermName} · ${school.sessionName}`
    : school.sessionName;

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
