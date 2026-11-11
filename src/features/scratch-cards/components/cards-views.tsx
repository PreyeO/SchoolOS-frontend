"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { CARD_STATUS_META, cardStatus } from "../lib/card-status";
import type { ScratchCard } from "../types";

interface Props {
  cards: ScratchCard[];
  onReplace: (card: ScratchCard) => void;
}

// Plus a quiet "Printed slip" tag on a live card whose PIN went out on the
// purchase's printed sheet: it isn't stock and can't be replaced, which is
// otherwise invisible until someone tries.
function StatusPill({ card }: { card: ScratchCard }) {
  const status = cardStatus(card);
  const meta = CARD_STATUS_META[status];
  return (
    <span className="inline-flex shrink-0 flex-wrap items-center gap-1">
      <span title={meta.hint} className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.className}`}>
        {meta.label}
      </span>
      {card.pins_revealed_at && status !== "replaced" && (
        <span
          title="Its PIN was on the sheet printed after purchase, so it isn't stock and has no named student."
          className="whitespace-nowrap rounded-full border border-n-200 px-2 py-0.5 text-[11px] text-n-500"
        >
          Printed slip
        </span>
      )}
    </span>
  );
}

// Not on a replaced card, and not on a printed slip (pins_revealed_at set):
// its PIN went out on the purchase sheet with no student, so it has no
// assignment and Replace can never work. The "Printed slip" tag says enough;
// a family who lost one gets a different card through Issue cards.
//
// Still shown on any other live card, including "Not used yet": it may have
// been issued to a student who hasn't checked a result yet. The card row
// doesn't say whether it's on an assignment; the dialog looks that up.
export function canOfferReplace(card: Pick<ScratchCard, "is_revoked" | "is_locked" | "student" | "pins_revealed_at">): boolean {
  return cardStatus(card) !== "replaced" && !card.pins_revealed_at;
}

function ReplaceButton({ card, onReplace }: { card: ScratchCard; onReplace: Props["onReplace"] }) {
  if (!canOfferReplace(card)) return null;
  return (
    <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 text-xs" onClick={() => onReplace(card)}>
      <RefreshCw className="size-3.5" /> Replace
    </Button>
  );
}

// Phones: one compact block per card. The six-column table needed ~710px and
// crushed the student column into a few letters a line, with the action
// scrolled off-screen.
export function CardsList({ cards, onReplace }: Props) {
  return (
    <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
      {cards.map((card) => (
        <li key={card.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-ink">{card.serial}</span>
              <StatusPill card={card} />
            </div>
            <p className="text-xs text-n-500 wrap-break-word">
              {card.student
                ? `${card.student.user.first_name} ${card.student.user.last_name} · ${card.student.admission_number}`
                : "No student yet"}
              {card.last_used_at ? ` · ${formatTimestamp(card.last_used_at)}` : ""}
            </p>
          </div>
          <ReplaceButton card={card} onReplace={onReplace} />
        </li>
      ))}
    </ul>
  );
}

// Wider screens: the full table, with room for every column.
export function CardsTableView({ cards, onReplace }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            <th className="px-3 py-2.5 font-medium">Serial</th>
            <th className="px-3 py-2.5 font-medium">Session</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 font-medium">Student</th>
            <th className="px-3 py-2.5 font-medium">Last used</th>
            <th className="px-3 py-2.5"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <tr key={card.id} className="border-b border-n-100 last:border-0 text-sm">
              <td className="whitespace-nowrap px-3 py-2.5 font-mono text-ink">{card.serial}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-n-500">{card.academic_session_name}</td>
              <td className="px-3 py-2.5"><StatusPill card={card} /></td>
              <td className="px-3 py-2.5 text-ink">
                {card.student ? (
                  <>
                    {card.student.user.first_name} {card.student.user.last_name}{" "}
                    <span className="whitespace-nowrap font-mono text-xs text-n-400">{card.student.admission_number}</span>
                  </>
                ) : (
                  <span className="text-n-400">—</span>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-n-500">
                {card.last_used_at ? formatTimestamp(card.last_used_at) : "—"}
              </td>
              <td className="px-3 py-2.5 text-right"><ReplaceButton card={card} onReplace={onReplace} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
