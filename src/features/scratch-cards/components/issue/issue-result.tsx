"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import type { CardPin, IssuanceBatch } from "../../types";
import { PinsSheet } from "../pins-sheet";

export type IssueOutcome =
  | { kind: "pins"; pins: CardPin[]; sessionName: string }
  | { kind: "texted"; batch: IssuanceBatch }
  // A replayed print commit (409): it went through, but its PINs were in a
  // response that never arrived and can't be fetched again.
  | { kind: "already-done" };

export function IssueResult({ outcome, onAnother }: { outcome: IssueOutcome; onAnother: () => void }) {
  const again = (
    <button type="button" onClick={onAnother} className="text-sm text-primary hover:underline">
      Issue more cards
    </button>
  );

  if (outcome.kind === "pins") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink">
          {outcome.pins.length} card{outcome.pins.length === 1 ? "" : "s"} issued for {outcome.sessionName}. Each slip
          carries the student&rsquo;s name.
        </p>
        <PinsSheet pins={outcome.pins} sessionName={outcome.sessionName} />
        {again}
      </div>
    );
  }

  if (outcome.kind === "texted") {
    return (
      <div className="space-y-3" role="status">
        <p className="flex items-start gap-2 text-sm text-ink">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-grass" />
          {outcome.batch.student_count} text{outcome.batch.student_count === 1 ? "" : "s"} queued. The first ones
          usually go out within seconds, a large send can take a few minutes, and you don&rsquo;t need to stay on this
          page.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href={`/scratch-cards/batches/${outcome.batch.id}`} className="text-sm text-primary hover:underline">
            Watch delivery
          </Link>
          {again}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink">
        These cards were already issued, but the PINs were in a response that never reached this screen, and
        SchoolOS can&rsquo;t show them again. Open each student&rsquo;s page (Card details on Result cards) and use
        Replace to print a new slip.
      </p>
      {again}
    </div>
  );
}
