"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { OverviewStudent } from "../../lib/card-overview";

const PILL: Record<OverviewStudent["state"], { label: string; className: string }> = {
  has_card: { label: "Has a card", className: "border-grass/30 bg-grass/10 text-grass" },
  ready: { label: "Waiting", className: "border-amber/40 bg-amber/15 text-ink" },
  needs_number: { label: "Needs a number", className: "border-amber/40 bg-amber/15 text-ink" },
};

interface Props {
  student: OverviewStudent;
  sessionId: string;
  onAddNumber: (student: OverviewStudent) => void;
}

// One student: where their card stands, and the one thing to do next.
// - Has a card: their page shows who it went to, delivery, and Replace.
// - Waiting with a number: send just theirs.
// - No usable number: add one (then they move to Waiting).
export function StudentCardRow({ student: s, sessionId, onAddNumber }: Props) {
  const pill = PILL[s.state];
  const detail =
    s.state === "has_card"
      ? "Has a card for this session"
      : s.state === "ready"
        ? `Will be texted to ${s.guardian_name || "the parent"}${s.phone_masked ? `, ${s.phone_masked}` : ""}`
        : s.invalidNumber
          ? "The saved number can't be texted"
          : "No parent number yet";
  const sendOne = `/scratch-cards/issue?student=${s.student_id}&name=${encodeURIComponent(s.student_name)}&adm=${encodeURIComponent(s.admission_number)}&session=${sessionId}&check=1`;

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
      <div className="min-w-0 flex-1 basis-56">
        <p className="text-sm font-semibold text-ink wrap-break-word">
          {s.student_name} <span className="font-mono text-xs font-normal text-n-400">{s.admission_number}</span>
        </p>
        <p className="text-xs text-n-500 wrap-break-word">{detail}</p>
      </div>
      {/* Pill and action stay together: on a phone they share one line under
          the name instead of landing on two lines at opposite edges. */}
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
      <span className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${pill.className}`}>{pill.label}</span>
      <div className="flex justify-end sm:w-36">
        {s.state === "has_card" && (
          <Button asChild variant="ghost" size="sm" className="h-9 text-xs">
            <Link href={`/students/${s.student_id}`}>Card details</Link>
          </Button>
        )}
        {s.state === "ready" && (
          <Button asChild variant="outline" size="sm" className="h-9 text-xs">
            <Link href={sendOne}>Send card</Link>
          </Button>
        )}
        {s.state === "needs_number" && (
          <Button type="button" variant="outline" size="sm" className="h-9 text-xs" onClick={() => onAddNumber(s)}>
            Add number
          </Button>
        )}
      </div>
      </div>
    </li>
  );
}
