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
import { toLocalIsoDate } from "@/lib/text/format-date";

import { useExtendAccess } from "../hooks/use-platform";
import { daysFromNow } from "./access-dialog-shared";

export function ExtendTrialDialog({ schoolId }: { schoolId: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(daysFromNow(30));
  const extend = useExtendAccess(schoolId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Extend trial
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend trial</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="trial-ends">Trial runs until</Label>
          <Input
            id="trial-ends"
            type="date"
            value={date}
            min={toLocalIsoDate()}
            onChange={(e) => setDate(e.target.value)}
          />
          <p className="text-xs text-n-400">
            The school regains full access immediately, with no charge recorded.
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={!date || extend.isPending}
            onClick={() =>
              extend.mutate({ trial_ends_at: date }, { onSuccess: () => setOpen(false) })
            }
          >
            {extend.isPending ? "Saving…" : "Extend trial"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
