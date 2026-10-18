"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useRegenerateCard } from "../hooks/use-scratch-card-mutations";
import type { CardPin, ScratchCard } from "../types";
import { PinsSheet } from "./pins-sheet";

// For a lost, locked or compromised card. Two steps in one dialog: confirm
// (the old serial dies for good), then the new serial and PIN, shown once.
// Closing the dialog drops the PIN from memory.
export function RegenerateCardDialog({ card }: { card: ScratchCard }) {
  const [open, setOpen] = useState(false);
  const [issued, setIssued] = useState<CardPin | null>(null);
  const regenerate = useRegenerateCard();
  const student = card.student ? `${card.student.user.first_name} ${card.student.user.last_name}` : null;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setIssued(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
          <RefreshCw className="size-3.5" /> Regenerate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{issued ? "New card issued" : `Regenerate ${card.serial}?`}</DialogTitle>
          {!issued && (
            <DialogDescription>
              The old serial and PIN stop working immediately and can&rsquo;t be restored.
              {student ? ` The new card stays with ${student}.` : " The new card is unused, like this one."}
            </DialogDescription>
          )}
        </DialogHeader>

        {issued ? (
          <PinsSheet pins={[issued]} sessionName={card.academic_session_name} />
        ) : (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={regenerate.isPending}
              onClick={() =>
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
