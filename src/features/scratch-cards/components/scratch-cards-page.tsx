"use client";

import { useState } from "react";
import Link from "next/link";
import { History, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { env } from "@/config/env";

import { useCardOverview } from "../hooks/use-card-overview";
import { BuyCardsDialog } from "./overview/buy-cards-dialog";
import { CardOverviewSection } from "./overview/card-overview-section";
import { useSessionFilter } from "./session-filter";
import { AttentionQueue } from "./sent/attention-queue";

// Result Cards, organised around one job: get every student's card to their
// parent this session (redesign agreed 2026-11-11; mockup linked in
// PROJECT.md). Texts needing a decision, progress with one "send to the
// waiting" button, what a send depends on, then students. Records (sends,
// numbers, every card, purchases) live on their own page; buying is a dialog.
// Gated on manage_scratch_cards by the nav registry (RouteAccessGuard).
export function ScratchCardsPage() {
  const session = useSessionFilter("overview", { allowAll: false });
  const [buying, setBuying] = useState(false);
  // Same query (and cache entry) as the overview below: no extra request.
  const stock = useCardOverview(session.sessionId).data?.stockLeft;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-ink">Result cards</h1>
          <p className="mt-1 max-w-2xl text-sm text-n-500">
            Each parent needs their child&rsquo;s card to check results online at{" "}
            <span className="font-mono text-ink">{env.SCHOOL_DOMAIN}/check-result</span>. Here&rsquo;s who has one,
            and who&rsquo;s still waiting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {session.hasSessions && session.control()}
          <Button asChild variant="outline" className="h-9">
            <Link href="/scratch-cards/records"><History className="size-4" aria-hidden /> Records</Link>
          </Button>
          {/* Filled, with the stock beside it: it's how a school sees it's running low. */}
          <div className="flex items-center gap-2 sm:ml-auto">
            {stock !== undefined && (
              <span className="whitespace-nowrap text-sm text-n-600">
                <span className="font-semibold tabular-nums text-ink">{stock.toLocaleString("en-NG")}</span> card
                {stock === 1 ? "" : "s"} left
              </span>
            )}
            <Button type="button" className="h-9" onClick={() => setBuying(true)}>
              <Plus className="size-4" aria-hidden /> Buy cards
            </Button>
          </div>
        </div>
      </div>

      <AttentionQueue />

      {session.sessionsLoading ? (
        <p className="text-sm text-n-400" role="status">Loading sessions…</p>
      ) : !session.sessionId ? (
        <p className="text-sm text-n-500">
          Cards belong to an academic session, and this school has none yet. Add one in Sessions &amp; Terms first.
        </p>
      ) : (
        <CardOverviewSection sessionId={session.sessionId} onBuy={() => setBuying(true)} />
      )}

      <BuyCardsDialog open={buying} onClose={() => setBuying(false)} />
    </div>
  );
}
