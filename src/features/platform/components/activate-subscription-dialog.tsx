"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNaira } from "@/lib/text/format-naira";
import { toLocalIsoDate } from "@/lib/text/format-date";

import { useExtendAccess } from "../hooks/use-platform";
import { daysFromNow } from "./access-dialog-shared";

export function ActivateSubscriptionDialog({
  schoolId,
  currentPrice,
}: {
  schoolId: string;
  currentPrice: number | null | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(daysFromNow(90));
  const [price, setPrice] = useState(String(currentPrice ?? 1000));
  const extend = useExtendAccess(schoolId);

  const parsedPrice = Number(price);
  const priceValid = Number.isInteger(parsedPrice) && parsedPrice >= 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          {currentPrice ? "Renew subscription" : "Activate subscription"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentPrice ? "Renew subscription" : "Activate subscription"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="sub-ends">Subscription runs until</Label>
            <Input
              id="sub-ends"
              type="date"
              value={date}
              min={toLocalIsoDate()}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price">Price per student</Label>
            <Input
              id="price"
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            {/* The price is sent WITH the date in one call — the backend
                rejects a price that has no subscription window to attach to,
                so the two can't be set separately here. */}
            <p className="text-xs text-n-400">
              Locked in for this school. Billing is manual — setting this records the
              price, it doesn&rsquo;t charge anything.
            </p>
          </div>

          {priceValid && (
            <p className="rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-xs text-n-600">
              Billed on capacity, not headcount — a school of 300 capacity at{" "}
              {formatNaira(parsedPrice)} projects{" "}
              <span className="font-medium text-ink">{formatNaira(parsedPrice * 300)}</span> a
              term.
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={!date || !priceValid || extend.isPending}
            onClick={() =>
              extend.mutate(
                { subscription_ends_at: date, price_per_student: parsedPrice },
                { onSuccess: () => setOpen(false) },
              )
            }
          >
            {extend.isPending ? "Saving…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
