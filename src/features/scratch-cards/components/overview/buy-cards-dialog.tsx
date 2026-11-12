"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatNaira } from "@/lib/text/format-naira";

import { useCardPrice } from "../../hooks/use-scratch-card-queries";
import { BuyCardsForm } from "../buy-cards-form";

// Buying is occasional (once or twice a term), so it's a dialog off the page
// header rather than a form on the page. The form itself is unchanged.
export function BuyCardsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: unitPrice } = useCardPrice();
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buy result cards</DialogTitle>
          <DialogDescription>
            Bought from SchoolOS{unitPrice !== undefined ? ` at ${formatNaira(unitPrice)} each` : ""}, paid through
            Paystack or Flutterwave. One card covers every term of its session.
          </DialogDescription>
        </DialogHeader>
        {open && <BuyCardsForm />}
      </DialogContent>
    </Dialog>
  );
}
