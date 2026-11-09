"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { newIdempotencyKey } from "@/lib/api/idempotency-key";
import { ChoiceGroup } from "@/features/scratch-cards/components/choice-group";
import { adjustSchoolWallet } from "@/features/wallet/api/wallet-api";

type Direction = "add" | "remove";
const DIRECTIONS: { value: Direction; label: string; hint: string }[] = [
  { value: "add", label: "Add credits", hint: "e.g. goodwill, or a payment received outside Paystack." },
  { value: "remove", label: "Remove credits", hint: "e.g. correcting a mistake. Refused if the balance can't cover it." },
];

// SchoolOS staff changing a school's SMS credit balance by hand, with a
// reason that shows in the school's wallet activity ("Adjusted by SchoolOS").
// Staff can't read the balance first (GET /wallet/ is school-only), so the
// result is shown from the response's balance_after.
export function AdjustCreditsDialog({ schoolId }: { schoolId: string }) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<Direction>("add");
  const [credits, setCredits] = useState("");
  const [reason, setReason] = useState("");
  // One per opening, reused on retry: a lost response can't apply twice.
  const [key, setKey] = useState(newIdempotencyKey);
  const adjust = useMutation({ mutationFn: adjustSchoolWallet, networkMode: "always" });

  const amount = Number(credits);
  const valid = Number.isInteger(amount) && amount > 0 && reason.trim().length > 0;

  function openChange(next: boolean) {
    if (next) { setDirection("add"); setCredits(""); setReason(""); setKey(newIdempotencyKey()); }
    setOpen(next);
  }

  function submit() {
    adjust.mutate(
      { school_id: schoolId, credits: direction === "add" ? amount : -amount, reason: reason.trim(), idempotency_key: key },
      {
        onSuccess: (entry) => {
          toast.success(`Done. The school now has ${entry.balance_after.toLocaleString("en-NG")} credits.`);
          setOpen(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">SMS credits</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust SMS credits</DialogTitle>
          <DialogDescription>The school sees this in its wallet activity, with your reason.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ChoiceGroup legend="Change" name="adjust-direction" options={DIRECTIONS} value={direction} onChange={setDirection} />
          <div className="space-y-1.5">
            <Label htmlFor="adjust-credits">Credits</Label>
            <Input id="adjust-credits" type="number" min={1} step={1} value={credits} onChange={(e) => setCredits(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adjust-reason">Reason</Label>
            <Input id="adjust-reason" maxLength={255} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" disabled={!valid || adjust.isPending} onClick={submit}>
            {adjust.isPending ? "Saving…" : direction === "add" ? `Add ${valid ? amount : ""} credits` : `Remove ${valid ? amount : ""} credits`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
