"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, Printer, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useSlipDetails } from "../hooks/use-slip-details";
import { downloadPinsCsv } from "../lib/pins-csv";
import { downloadPinsPdf } from "../lib/pins-pdf";
import { printPinSlips } from "../lib/print-pins";
import type { CardPin } from "../types";

interface Props {
  pins: CardPin[];
  sessionName: string;
}

// The one moment a school sees its PINs. They are not stored anywhere readable
// (the server keeps only a hash) and can't be shown again, so the page warns
// before leaving until they've been downloaded or printed.
export function PinsSheet({ pins, sessionName }: Props) {
  const details = useSlipDetails(sessionName);
  const [saved, setSaved] = useState(false);
  const [making, setMaking] = useState(false);

  useEffect(() => {
    if (saved) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saved]);

  // The PDF is the main way out: it opens on any phone, forwards on WhatsApp,
  // and a print shop can run it. CSV is for whoever wants a spreadsheet.
  async function downloadPdf() {
    setMaking(true);
    try {
      await downloadPinsPdf(pins, details);
      setSaved(true);
    } catch {
      toast.error("Couldn't make the PDF. Download the CSV instead, so the PINs aren't lost.");
    } finally {
      setMaking(false);
    }
  }

  function downloadCsv() {
    downloadPinsCsv(pins, sessionName);
    setSaved(true);
  }

  function print() {
    if (printPinSlips(pins, details)) {
      setSaved(true);
    } else {
      toast.error("Your browser blocked the print window. Download the PDF instead, or allow pop-ups for this site.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-clay/30 bg-clay/10 px-3.5 py-3">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-clay" />
        <p className="text-sm text-ink">
          <span className="font-medium">Save these now.</span> The PINs won&rsquo;t be shown again. If one is
          lost later, use Regenerate on that card to issue a new one.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={downloadPdf} disabled={making}>
          <Download className="size-4" /> {making ? "Making PDF…" : "Download PDF"}
        </Button>
        <Button type="button" variant="outline" onClick={print}>
          <Printer className="size-4" /> Print slips
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={downloadCsv} className="text-n-500">
          <FileSpreadsheet className="size-4" /> CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
              <th className="px-3 py-2.5 font-medium">Serial</th>
              <th className="px-3 py-2.5 font-medium">PIN</th>
            </tr>
          </thead>
          <tbody>
            {pins.map((p) => (
              <tr key={p.serial} className="border-b border-n-100 last:border-0">
                <td className="px-3 py-2.5 font-mono text-sm text-ink">{p.serial}</td>
                <td className="px-3 py-2.5 font-mono text-sm tracking-wider text-ink">{p.pin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
