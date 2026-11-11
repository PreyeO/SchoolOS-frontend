"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/config/env";
import { ContactsPanel } from "@/features/guardian-contacts/components/contacts-panel";

import { CardsTable } from "./cards-table";
import { BuyCardsDialog } from "./overview/buy-cards-dialog";
import { CardOverviewSection } from "./overview/card-overview-section";
import { PurchasesTable } from "./purchases-table";
import { useSessionFilter } from "./session-filter";
import { AttentionQueue } from "./sent/attention-queue";
import { BatchesList } from "./sent/batches-list";

// Result Cards, organised around one job: get every student's card to their
// parent this session (redesign agreed 2026-11-11; the clickable mockup is
// linked in PROJECT.md). Top to bottom: texts needing a decision, progress
// with one "send to the waiting" button, what a send depends on, students
// (not cards), then the records. Buying is a dialog: it's occasional.
// Gated on manage_scratch_cards by the nav registry (RouteAccessGuard).
export function ScratchCardsPage() {
  const session = useSessionFilter("overview", { allowAll: false });
  const [buying, setBuying] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-ink">Result cards</h1>
          <p className="mt-1 max-w-2xl text-sm text-n-500">
            Each parent needs their child&rsquo;s card to check results online at{" "}
            <span className="font-mono text-ink">{env.SCHOOL_DOMAIN}/check-result</span>. Here&rsquo;s who has one,
            and who&rsquo;s still waiting.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          {session.hasSessions && session.control()}
          <Button type="button" variant="outline" className="h-9" onClick={() => setBuying(true)}>
            Buy more cards
          </Button>
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

      <section aria-labelledby="records-heading" className="space-y-3">
        <h2 id="records-heading" className="text-sm font-semibold text-ink">Records</h2>
        <Tabs defaultValue="sent">
          <TabsList>
            <TabsTrigger value="sent">Past sends</TabsTrigger>
            <TabsTrigger value="numbers">Parent numbers</TabsTrigger>
            <TabsTrigger value="cards">Every card</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
          </TabsList>
          <TabsContent value="sent" className="pt-3"><BatchesList /></TabsContent>
          <TabsContent value="numbers" className="pt-3"><ContactsPanel /></TabsContent>
          <TabsContent value="cards" className="pt-3"><CardsTable /></TabsContent>
          <TabsContent value="purchases" className="pt-3"><PurchasesTable /></TabsContent>
        </Tabs>
      </section>

      <BuyCardsDialog open={buying} onClose={() => setBuying(false)} />
    </div>
  );
}
