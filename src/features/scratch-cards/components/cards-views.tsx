"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { CARD_STATUS_META, cardStatus } from "../lib/card-status";
import type { ScratchCard } from "../types";

interface Props {
  cards: ScratchCard[];
  onRegenerate: (card: ScratchCard) => void;
}

function StatusPill({ card }: { card: ScratchCard }) {
  const meta = CARD_STATUS_META[cardStatus(card)];
  return (
    <span title={meta.hint} className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function RegenerateButton({ card, onRegenerate }: { card: ScratchCard; onRegenerate: Props["onRegenerate"] }) {
  if (cardStatus(card) === "replaced") return null;
  return (
    <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 text-xs" onClick={() => onRegenerate(card)}>
      <RefreshCw className="size-3.5" /> Regenerate
    </Button>
  );
}

// Phones: one compact block per card. The six-column table needed ~710px and
// crushed the student column into a few letters a line, with Regenerate
// scrolled off-screen.
export function CardsList({ cards, onRegenerate }: Props) {
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
                : "Not used yet"}
              {card.last_used_at ? ` · ${formatTimestamp(card.last_used_at)}` : ""}
            </p>
          </div>
          <RegenerateButton card={card} onRegenerate={onRegenerate} />
        </li>
      ))}
    </ul>
  );
}

// Wider screens: the full table, with room for every column.
export function CardsTableView({ cards, onRegenerate }: Props) {
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
              <td className="px-3 py-2.5 text-right"><RegenerateButton card={card} onRegenerate={onRegenerate} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
