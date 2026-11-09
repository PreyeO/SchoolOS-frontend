"use client";

import { Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

import { useSlipDetails } from "../hooks/use-slip-details";
import { downloadPinsPdf } from "../lib/pins-pdf";
import type { CardPin } from "../types";

interface Props {
  pin: CardPin;
  sessionName: string;
  onDone: () => void;
}

// A freshly issued serial and PIN, shown once. The PIN lives only in the
// parent's state; Done drops it.
export function IssuedPinPanel({ pin, sessionName, onDone }: Props) {
  const slip = useSlipDetails(sessionName);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Serial: ${pin.serial}  PIN: ${pin.pin}`);
      toast.success("Serial and PIN copied.");
    } catch {
      toast.error("Couldn't copy. Select the PIN and copy it by hand.");
    }
  }

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-1 gap-3 rounded-xl border border-n-200 bg-n-50 p-4 sm:grid-cols-2">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">Serial</dt>
          <dd className="mt-1 font-mono text-lg font-semibold text-ink select-all">{pin.serial}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">PIN</dt>
          <dd className="mt-1 font-mono text-lg font-semibold tracking-widest text-ink select-all">{pin.pin}</dd>
        </div>
      </dl>
      <p className="flex items-start gap-2 text-xs text-n-500">
        <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-clay" />
        SchoolOS keeps only a scrambled copy of each PIN, so nobody can look it up later. If it&rsquo;s lost, replace
        the card again.
      </p>
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={copy}>
          <Copy className="size-4" /> Copy
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            downloadPinsPdf([pin], slip).catch(() => toast.error("Couldn't make the PDF. Copy the PIN instead."))
          }
        >
          Download slip
        </Button>
        <Button type="button" onClick={onDone}>Done</Button>
      </DialogFooter>
    </div>
  );
}
