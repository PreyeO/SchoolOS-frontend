"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getErrorMessage, isConflictError } from "@/lib/api/get-error-message";
import { newIdempotencyKey } from "@/lib/api/idempotency-key";

import { useReplaceCard } from "../hooks/use-scratch-card-mutations";
import { useActiveAssignment } from "../hooks/use-scratch-card-queries";
import { toCardPin } from "../lib/issuance-verdict";
import { whyNotReplaceable } from "../lib/why-not-replaceable";
import type { CardPin, ScratchCard } from "../types";
import { IssuedPinPanel } from "./issued-pin-panel";
import { ReplaceCardForm } from "./replace-card-form";

interface Props {
  // Held by the TABLE, not the row: a print replace rotates the card, the
  // refetch turns this row "Replaced", and a dialog living in it would unmount
  // with the new PIN. Mount with key={card.id} so each opening starts fresh,
  // with its own idempotency key.
  card: ScratchCard | null;
  onClose: () => void;
}

type Outcome = { kind: "pin"; pin: CardPin } | { kind: "texted" } | { kind: "already-done" };

const COPY: Record<Outcome["kind"], string> = {
  pin: "This is the only time this PIN is shown. Copy it or download it before closing.",
  texted:
    "The new serial and PIN are queued to the guardian's phone, and only go there. This serial stops working once the text is sent, usually within a minute.",
  "already-done":
    "This replacement already went through, but its PIN was in a response that never reached this screen. The card now has a new serial; replace that one to get another PIN.",
};

export function ReplaceCardDialog({ card, onClose }: Props) {
  // One key per opening, reused on every retry: if a response is lost, the
  // retry can't take the card twice or spend credits twice.
  const [idempotencyKey] = useState(newIdempotencyKey);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const assignment = useActiveAssignment(card?.id ?? null);
  const replace = useReplaceCard();

  let description: string;
  let body: React.ReactNode;
  const closeFooter = (
    <DialogFooter>
      <Button type="button" onClick={onClose}>Close</Button>
    </DialogFooter>
  );

  if (outcome?.kind === "pin" && card) {
    description = COPY.pin;
    body = <IssuedPinPanel pin={outcome.pin} sessionName={card.academic_session_name} onDone={onClose} />;
  } else if (outcome) {
    description = COPY[outcome.kind];
    body = closeFooter;
  } else if (assignment.isPending) {
    description = "Checking who this card was given to…";
    body = null;
  } else if (assignment.isError) {
    description = getErrorMessage(assignment.error);
    body = closeFooter;
  } else if (!assignment.data) {
    description = card ? whyNotReplaceable(card) : "";
    body = closeFooter;
  } else {
    description = "The old serial and PIN stop working and can't be restored. The new card goes to the same student.";
    body = (
      <ReplaceCardForm
        assignment={assignment.data}
        pending={replace.isPending}
        onCancel={onClose}
        onSubmit={(choice) =>
          card &&
          replace.mutate(
            { id: card.id, ...choice, idempotency_key: idempotencyKey },
            {
              onSuccess: ({ pins }) =>
                setOutcome(pins?.[0] ? { kind: "pin", pin: toCardPin(pins[0]) } : { kind: "texted" }),
              onError: (error) =>
                isConflictError(error) ? setOutcome({ kind: "already-done" }) : toast.error(getErrorMessage(error)),
            },
          )
        }
      />
    );
  }

  return (
    <Dialog open={!!card} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{outcome?.kind === "pin" ? "New card issued" : `Replace card ${card?.serial ?? ""}`}</DialogTitle>
          <DialogDescription role={assignment.isPending ? "status" : undefined}>{description}</DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}
