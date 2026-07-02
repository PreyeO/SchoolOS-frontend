"use client";

import { CalendarRange } from "lucide-react";

import { useSchoolStore } from "@/stores/school-store";

export function TermChip() {
  const school = useSchoolStore((s) => s.currentSchool);

  if (!school?.sessionName) return null;

  const label = school.currentTermName
    ? `${school.currentTermName} · ${school.sessionName}`
    : school.sessionName;

  return (
    <div className="hidden md:flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground/70">
      <CalendarRange className="size-3.5 text-primary" />
      {label}
    </div>
  );
}
