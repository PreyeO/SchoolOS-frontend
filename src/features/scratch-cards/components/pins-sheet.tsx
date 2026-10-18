"use client";

import { useEffect, useState } from "react";
import { Download, Printer, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { useSchoolStore } from "@/stores/school-store";

import { downloadPinsCsv } from "../lib/pins-csv";
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
  const schoolName = useSchoolStore((s) => s.currentSchool?.name) ?? "Your school";
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saved]);

  function download() {
    downloadPinsCsv(pins, sessionName);
    setSaved(true);
  }

  function print() {
    // The apex, not this school's subdomain: a card works from any host, and
    // the bare domain is the shortest thing to print and type.
    const checkUrl = `${env.SCHOOL_DOMAIN}/check-result`;
    if (printPinSlips(pins, { schoolName, sessionName, checkUrl })) {
      setSaved(true);
    } else {
      toast.error("Your browser blocked the print window. Download the CSV instead, or allow pop-ups for this site.");
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

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={download}>
          <Download className="size-4" /> Download CSV
        </Button>
        <Button type="button" variant="outline" onClick={print}>
          <Printer className="size-4" /> Print slips
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
