"use client";

import { useState } from "react";
import { Info } from "lucide-react";

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
import type { SchoolDetailResponse } from "@/lib/school/get-school-detail";
import { formatNaira } from "@/lib/text/format-naira";

import { estimateProration } from "../lib/estimate-proration";
import { useUpdateCapacity } from "../hooks/use-update-capacity";

interface Props {
  school: SchoolDetailResponse;
  trigger: React.ReactNode;
  // Seats in use (see useSeatUsage), when known. The backend refuses a
  // capacity below it; knowing it here turns that 400 into a stated floor.
  seatsUsed?: number;
}

// Changing how many students the school is licensed for.
//
// An increase on a subscribed school is chargeable, and the amount is shown
// BEFORE committing — the school's explicit ask, since this is the real figure
// they'll be invoiced. It's computed client-side (see estimateProration) because
// the authoritative number only exists in the response, by which point the
// charge is already recorded. The response's own figure is then shown as the
// confirmed one.
export function UpdateCapacityDialog({ school, trigger, seatsUsed }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(school.student_capacity ?? ""));
  const update = useUpdateCapacity();

  const parsed = Number(value);
  const belowUsed = seatsUsed !== undefined && parsed < seatsUsed;
  const isValid = Number.isInteger(parsed) && parsed >= 1 && !belowUsed;
  const unchanged = parsed === school.student_capacity;
  const estimate = isValid ? estimateProration(school, parsed) : null;

  function handleSave() {
    update.mutate(parsed, {
      onSuccess: () => setOpen(false),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Reset to the stored value on close so a cancelled edit doesn't
        // persist into the next open.
        if (!next) setValue(String(school.student_capacity ?? ""));
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Student capacity</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="student-capacity">How many students can this school hold?</Label>
            <Input
              id="student-capacity"
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            {belowUsed ? (
              <p className="text-xs text-destructive">
                {seatsUsed} students are using a seat, so capacity can&rsquo;t go below{" "}
                {seatsUsed}.
              </p>
            ) : (
              <p className="text-xs text-n-400">
                Currently {school.student_capacity}
                {seatsUsed !== undefined ? `, with ${seatsUsed} in use` : ""}. It can&rsquo;t be
                set below the number of students using a seat.
              </p>
            )}
          </div>

          {estimate && (
            <div className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-3">
              <p className="text-sm font-medium text-ink">
                This adds {estimate.studentsAdded} student
                {estimate.studentsAdded === 1 ? "" : "s"} to your subscription.
              </p>
              <p className="mt-1 font-display text-xl font-bold tabular-nums text-ink">
                {formatNaira(estimate.amount)}
              </p>
              <p className="mt-0.5 text-xs text-n-600">
                Prorated for the {estimate.daysRemaining} day
                {estimate.daysRemaining === 1 ? "" : "s"} left in this billing period. This
                is added to your next invoice — nothing is charged now.
              </p>
            </div>
          )}

          {/* A decrease, or any change during trial, records no charge at all.
              Saying so prevents "will this cost me?" being the reason someone
              doesn't right-size their capacity. */}
          {isValid && !unchanged && !estimate && (
            <p className="flex items-start gap-2 rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-xs text-n-600">
              <Info className="mt-0.5 size-3.5 shrink-0 text-n-400" />
              No charge for this change.
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
            onClick={handleSave}
            disabled={!isValid || unchanged || update.isPending}
          >
            {update.isPending ? "Saving…" : "Update capacity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
