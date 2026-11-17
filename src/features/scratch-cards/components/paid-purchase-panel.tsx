"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useRevealPins } from "../hooks/use-scratch-card-mutations";
import type { CardPin, CardPurchase } from "../types";
import { PinsSheet } from "./pins-sheet";

const BACK = <Link href="/scratch-cards" className="text-sm text-primary hover:underline">Back to Result Cards</Link>;

// A paid purchase. Since backend 7ebd0d3 the PINs are NOT revealed on arrival:
// keeping the cards in stock (to issue to named students) is the default, and
// that path must never call reveal. Revealing turns them into anonymous
// slips (pins_revealed_at): out of stock, never issuable or replaceable.
// So it's offered second, behind a plain-language confirm.
interface Props {
  purchase: CardPurchase;
  // Re-reads the purchase. After an EMPTY reveal the copy we hold may predate
  // a reveal whose response was lost, so pins_revealed_at must be fresh before
  // saying "still in stock" versus "already shown".
  onRevealedEmpty: () => void;
  isRefreshing: boolean;
}

export function PaidPurchasePanel({ purchase, onRevealedEmpty, isRefreshing }: Props) {
  const reveal = useRevealPins();
  const [asking, setAsking] = useState(false);
  const [pins, setPins] = useState<CardPin[] | null>(null);
  const count = `${purchase.quantity} card${purchase.quantity === 1 ? "" : "s"}`;
  const showPins = () =>
    reveal.mutate(purchase.id, {
      onSuccess: (result) => {
        setPins(result);
        if (result.length === 0) onRevealedEmpty();
      },
    });

  if (pins && pins.length > 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink">{pins.length} anonymous slips for {purchase.academic_session_name}.</p>
        <PinsSheet pins={pins} sessionName={purchase.academic_session_name} />
        {BACK}
      </div>
    );
  }

  // Already revealed (an earlier visit, or a reveal whose response was lost):
  // checked before the empty-reveal message, from the freshly re-read purchase.
  if (purchase.pins_revealed_at) {
    return (
      <p className="text-sm text-ink">
        Payment confirmed. These PINs were already shown as anonymous slips, so they can&rsquo;t be shown again. Those
        cards still work, but they&rsquo;re not in stock for issuing. {BACK}
      </p>
    );
  }

  if (pins && isRefreshing) {
    return <p className="text-sm text-n-400" role="status">Checking what happened to these PINs…</p>;
  }

  if (pins) {
    // Empty, and the purchase (re-read) has no reveal stamp: the 15-minute
    // window ran out, nothing was shown, and the cards stayed in stock.
    return (
      <p className="text-sm text-ink">
        More than 15 minutes have passed since payment, so the PINs can&rsquo;t be shown now. The cards are still in
        stock: issue them to students and each gets a fresh PIN. {BACK}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm text-ink">
          Payment confirmed: <span className="font-medium">{count}</span> for {purchase.academic_session_name}, now in
          stock. Issue them to students: each card is tied to its student, texted to a parent or printed with their
          name, and can be replaced if lost.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Button asChild><Link href="/scratch-cards/issue">Issue cards</Link></Button>
          {BACK}
        </div>
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-4">
        {!asking ? (
          <p className="text-sm text-n-600">
            Need slips to hand out without names instead?{" "}
            <button type="button" className="text-primary hover:underline" onClick={() => setAsking(true)}>
              Show the PINs now
            </button>
          </p>
        ) : (
          <div className="space-y-3" role="alertdialog" aria-labelledby="reveal-heading" aria-describedby="reveal-desc">
            <p id="reveal-heading" className="flex items-center gap-2 text-sm font-medium text-ink">
              <ShieldAlert className="size-4 text-clay" /> Show these PINs as anonymous slips?
            </p>
            <ul id="reveal-desc" className="list-disc space-y-1 pl-5 text-sm text-n-600">
              <li>No student is recorded, so you won&rsquo;t know which family got which slip.</li>
              <li>These cards leave stock: they can&rsquo;t be issued to a student later, and a lost one can&rsquo;t be replaced.</li>
              <li>The PINs are shown once. Save or print them before leaving this page.</li>
              <li>This only works within 15 minutes of payment.</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={reveal.isPending} onClick={showPins}>
                {reveal.isPending ? "Getting PINs…" : reveal.isError ? "Try again" : `Show ${count} as slips`}
              </Button>
              <Button type="button" variant="ghost" disabled={reveal.isPending} onClick={() => setAsking(false)}>
                Keep them in stock
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
