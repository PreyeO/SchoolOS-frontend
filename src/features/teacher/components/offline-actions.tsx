"use client";

import Link from "next/link";
import { ClipboardCheck, CloudOff, SquarePen } from "lucide-react";

import { useOnlineStatus, useSyncStatus } from "@/features/attendance/hooks/use-sync-status";

const ACTIONS = [
  {
    href: "/attendance",
    icon: ClipboardCheck,
    label: "Take a register",
    detail: "Mark today's attendance",
  },
  {
    href: "/results",
    icon: SquarePen,
    label: "Enter scores",
    detail: "Record CA and exam marks",
  },
];

// Offline is a mode a teacher is *in*, not an error that happened to them — but
// the only signal for it was a small pill in the top bar, which is easy to miss
// on a phone in a classroom. Without it, the first sign of being offline is a
// screen that won't load, which reads as the app being broken.
//
// Additive, never a replacement: the dashboard behind this works offline in full
// — tiles, today's registers, the trend — so swapping it for a menu would take
// away more than it gave. This just names the mode and points at the screens
// that keep working.
//
// It promises availability, not content. A sheet never opened on this device
// still has nothing cached, and those screens say so themselves; over-promising
// here would only move the dead end one tap later.
//
// Behaviour ratings are deliberately absent. They're term-end work done sitting
// down, not classroom work — and the screen they live on is half online-only
// anyway, since remarks carry no client timestamp and so can't be queued. Offline
// support there would have saved the ratings and failed the remarks on the same
// page, which is worse than saying plainly that it needs a connection.
export function OfflineActions() {
  const isOnline = useOnlineStatus();
  const { pendingCount } = useSyncStatus();

  if (isOnline) return null;

  return (
    <section className="rounded-xl border border-n-200 bg-n-50 p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white">
          <CloudOff className="size-4 text-n-400" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-ink">You&rsquo;re offline</h2>
          <p className="mt-0.5 text-sm text-n-500">
            {pendingCount > 0
              ? `${pendingCount} ${pendingCount === 1 ? "batch is" : "batches are"} saved on this device and will sync by themselves. You can keep working:`
              : "Your work is saved on this device and syncs by itself when you're back. You can keep going with:"}
          </p>
        </div>
      </div>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.href}>
              <Link
                href={action.href}
                className="flex h-full items-start gap-2.5 rounded-lg border border-n-200 bg-white p-3 transition-colors hover:border-n-300"
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{action.label}</span>
                  <span className="block text-xs text-n-500">{action.detail}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-n-400">
        Anything else — student records, settings, reports — needs a connection and will say so.
      </p>
    </section>
  );
}
