"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getScratchCard } from "../api/scratch-cards-api";
import { SCRATCH_CARDS_KEY } from "../hooks/use-scratch-card-queries";
import { ReplaceCardDialog } from "./replace-card-dialog";

// Replace, from a student's card history. That's where an owner looks for a
// lost card (the overview's "Card details"), so it belongs there and not only
// in Records → Every card. The dialog needs the card row, which an assignment
// doesn't carry, so it's loaded on the first click.
export function ReplaceFromHistory({ cardId }: { cardId: string }) {
  const [open, setOpen] = useState(false);
  const card = useQuery({
    queryKey: [...SCRATCH_CARDS_KEY, "card", cardId],
    queryFn: () => getScratchCard(cardId),
    enabled: open,
  });

  return (
    <>
      <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" disabled={open && card.isPending} onClick={() => setOpen(true)}>
        <RefreshCw className="size-3.5" aria-hidden /> {open && card.isPending ? "Opening…" : "Replace"}
      </Button>
      <ReplaceCardDialog key={open ? cardId : "closed"} card={open && card.data ? card.data : null} onClose={() => setOpen(false)} />
    </>
  );
}
