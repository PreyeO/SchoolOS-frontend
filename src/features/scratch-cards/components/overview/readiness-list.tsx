"use client";

import Link from "next/link";
import { AlertTriangle, Check } from "lucide-react";

import { useCanAccess } from "@/lib/auth/use-can-access";

import type { CardOverview } from "../../lib/card-overview";

interface Item {
  ok: boolean;
  title: string;
  detail: string;
  fix?: { label: string; href?: string; onClick?: () => void };
}

// "Ready to send?": the three things a send depends on, each green or amber
// with its fix one click away. Hidden once nobody is waiting.
export function ReadinessList({ overview: o, onBuy }: { overview: CardOverview; onBuy: () => void }) {
  const canTopUp = useCanAccess("/settings/payments");
  if (o.waiting === 0) return null;

  const items: Item[] = [
    o.stockLeft >= o.waiting
      ? { ok: true, title: `${o.stockLeft.toLocaleString()} cards left`, detail: "Enough for everyone waiting." }
      : {
          ok: false,
          title: `${o.stockLeft.toLocaleString()} cards left, ${o.waiting.toLocaleString()} needed`,
          detail: `Buy ${(o.waiting - o.stockLeft).toLocaleString()} more to cover everyone.`,
          fix: { label: "Buy cards", onClick: onBuy },
        },
    o.needsNumber === 0
      ? { ok: true, title: "Every waiting student has a number", detail: "Their cards can all be texted." }
      : {
          ok: false,
          title: `${o.needsNumber.toLocaleString()} student${o.needsNumber === 1 ? " has" : "s have"} no parent number`,
          detail: "Add them below or when you send, or print their slips.",
        },
    o.credits >= o.creditsToTextReady
      ? { ok: true, title: `${o.credits.toLocaleString()} SMS credits`, detail: "Enough to text everyone with a number." }
      : {
          ok: false,
          title: `${o.credits.toLocaleString()} SMS credits, ${o.creditsToTextReady.toLocaleString()} needed`,
          detail: "Top up to text them, or print slips instead.",
          fix: canTopUp ? { label: "Top up", href: "/settings/payments" } : undefined,
        },
  ];

  return (
    <section aria-labelledby="ready-heading" className="space-y-3 rounded-2xl border border-n-200 bg-white p-5">
      <h2 id="ready-heading" className="text-sm font-semibold text-ink">Ready to send?</h2>
      <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {items.map((item) => (
          <li key={item.title} className={`flex gap-2.5 rounded-xl p-3 ${item.ok ? "bg-grass/10" : "bg-amber/15"}`}>
            {item.ok ? (
              <Check className="mt-0.5 size-4 shrink-0 text-grass" aria-hidden />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden />
            )}
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <p className="text-xs text-n-600">{item.detail}</p>
              {item.fix?.href && <Link href={item.fix.href} className="text-xs font-medium text-primary hover:underline">{item.fix.label}</Link>}
              {item.fix?.onClick && (
                <button type="button" onClick={item.fix.onClick} className="text-xs font-medium text-primary hover:underline">
                  {item.fix.label}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
