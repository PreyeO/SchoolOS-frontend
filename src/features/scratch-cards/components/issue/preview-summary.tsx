"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { formatNaira } from "@/lib/text/format-naira";
import { useCanAccess } from "@/lib/auth/use-can-access";

import type { IssuanceChannel, IssuancePreview } from "../../types";
import type { Verdict } from "../../lib/issuance-verdict";
import { multiPageCount } from "../../lib/issuance-verdict";

interface Props {
  preview: IssuancePreview;
  channel: IssuanceChannel;
  verdict: Verdict;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "bad" }) {
  return (
    <div className="rounded-lg bg-n-50 px-3 py-2.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">{label}</dt>
      <dd className={`mt-0.5 font-display text-lg font-bold tabular-nums ${tone === "bad" ? "text-clay" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

// The numbers that decide the send, then what (if anything) stops it. Links
// to buy cards or top up appear only for someone who can open those pages:
// the wallet has its own permission.
export function PreviewSummary({ preview, channel, verdict }: Props) {
  const canBuy = useCanAccess("/scratch-cards");
  const canTopUp = useCanAccess("/settings/payments");
  const multi = channel === "sms" ? multiPageCount(preview) : 0;

  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Getting a card" value={String(preview.eligible.length)} />
        <Stat label="Cards in stock" value={String(preview.stock_available)} tone={preview.stock_shortfall ? "bad" : undefined} />
        {channel === "sms" && (
          <>
            <Stat label="Credits needed" value={String(preview.credits_required)} tone={preview.credit_shortfall ? "bad" : undefined} />
            <Stat label="In the wallet" value={String(preview.wallet_balance)} />
          </>
        )}
      </dl>

      {channel === "sms" && preview.credits_required > 0 && (
        <p className="text-sm text-n-600">
          Costs about {formatNaira(preview.estimated_cost_naira)} in SMS credits.
          {multi > 0 &&
            ` ${multi} of these texts cost 2 or more credits each, because a name has an apostrophe, accent or other special character.`}
        </p>
      )}

      {verdict.blockers.length > 0 && (
        <div role="alert" className="space-y-1.5 rounded-lg border border-clay/30 bg-clay/10 px-3.5 py-3">
          {verdict.blockers.map((b) => (
            <p key={b} className="flex items-start gap-2 text-sm text-ink">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-clay" /> {b}
            </p>
          ))}
          <p className="flex flex-wrap gap-x-4 pl-6 text-sm">
            {preview.stock_shortfall > 0 && canBuy && (
              <Link href="/scratch-cards" className="text-primary hover:underline">Buy cards</Link>
            )}
            {channel === "sms" && preview.credit_shortfall > 0 && canTopUp && (
              <Link href="/settings/payments" className="text-primary hover:underline">Top up SMS credits</Link>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
