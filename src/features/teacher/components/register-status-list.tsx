"use client";

import Link from "next/link";
import { Check, CircleDashed } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { RegisterStatus } from "../hooks/use-teacher-overview";

// Marked / not-marked is a state, not a magnitude — so a list with status chips,
// not a chart. Status colour always ships with an icon and a word, never colour
// alone.
export function RegisterStatusList({ registers }: { registers: RegisterStatus[] }) {
  return (
    <ul className="divide-y divide-n-100">
      {registers.map((register) => (
        <li key={register.classArmId} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{register.label}</span>
            <span className="block truncate text-xs text-n-400">{register.subjects.join(", ")}</span>
          </span>

          {register.markedToday ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-900">
              <Check className="size-3.5 shrink-0" />
              {register.presentToday} of {register.totalToday} present
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 text-xs text-ink">
              <CircleDashed className="size-3.5 shrink-0 text-amber" />
              Not marked
            </span>
          )}

          <Button type="button" variant="ghost" size="sm" asChild className="h-7 text-xs text-primary">
            <Link href="/attendance">{register.markedToday ? "Review" : "Take register"}</Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}
