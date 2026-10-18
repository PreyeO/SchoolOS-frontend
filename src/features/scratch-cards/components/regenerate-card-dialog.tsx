"use client";

import { useState } from "react";
import { Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useRegenerateCard } from "../hooks/use-scratch-card-mutations";
import { downloadPinsCsv } from "../lib/pins-csv";
import type { CardPin, ScratchCard } from "../types";

interface Props {
  // The card being replaced, or null when closed. Held by the TABLE, not the
  // row: regenerating turns the old card "Replaced" on the next refetch, and a
  // dialog living in that row unmounted with it, taking the new PIN along.
  card: ScratchCard | null;
  onClose: () => void;
}

// Two steps: confirm (the old serial dies for good), then the new serial and
// PIN, shown once. Closing drops the PIN from memory.
export function RegenerateCardDialog({ card, onClose }: Props) {
  const [issued, setIssued] = useState<CardPin | null>(null);
  const regenerate = useRegenerateCard();
  const student = card?.student ? `${card.student.user.first_name} ${card.student.user.last_name}` : null;

  function close() {
    setIssued(null);
    regenerate.reset();
    onClose();
  }

  async function copy(pin: CardPin) {
    try {
      await navigator.clipboard.writeText(`Serial: ${pin.serial}  PIN: ${pin.pin}`);
      toast.success("Serial and PIN copied.");
    } catch {
      toast.error("Couldn't copy. Select the PIN and copy it by hand.");
    }
  }

  return (
    <Dialog open={!!card} onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{issued ? "New card issued" : `Replace card ${card?.serial ?? ""}?`}</DialogTitle>
          <DialogDescription>
            {issued
              ? "This is the only time this PIN is shown. Copy it or download it before closing."
              : `The old serial and PIN stop working immediately and can't be restored.${
                  student ? ` The new card stays with ${student}.` : " The new card is unused, like this one."
                }`}
          </DialogDescription>
        </DialogHeader>

        {issued && card ? (
          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-3 rounded-xl border border-n-200 bg-n-50 p-4 sm:grid-cols-2">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">Serial</dt>
                <dd className="mt-1 font-mono text-lg font-semibold text-ink select-all">{issued.serial}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">PIN</dt>
                <dd className="mt-1 font-mono text-lg font-semibold tracking-widest text-ink select-all">{issued.pin}</dd>
              </div>
            </dl>
            <p className="flex items-start gap-2 text-xs text-n-500">
              <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-clay" />
              SchoolOS keeps only a scrambled copy of each PIN, so nobody can look it up later. If it&rsquo;s lost,
              replace the card again.
            </p>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => copy(issued)}>
                <Copy className="size-4" /> Copy
              </Button>
              <Button type="button" variant="outline" onClick={() => downloadPinsCsv([issued], card.academic_session_name)}>
                Download
              </Button>
              <Button type="button" onClick={close}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button
              type="button"
              disabled={regenerate.isPending || !card}
              onClick={() =>
                card &&
                regenerate.mutate(card.id, {
                  onSuccess: ({ card: next, pin }) => setIssued({ serial: next.serial, pin }),
                })
              }
            >
              {regenerate.isPending ? "Issuing…" : "Issue new card"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
