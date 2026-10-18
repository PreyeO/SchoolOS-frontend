"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/config/env";

import { BuyCardsForm } from "./buy-cards-form";
import { CardsTable } from "./cards-table";
import { PurchasesTable } from "./purchases-table";

// Result-check cards: the school buys them from SchoolOS, hands one to each
// family, and parents check results at /check-result without an account.
// Gated on manage_scratch_cards by the nav registry (RouteAccessGuard).
export function ScratchCardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Scratch cards</h1>
        <p className="mt-1 max-w-2xl text-sm text-n-500">
          Parents use a card to check their child&rsquo;s results at{" "}
          <span className="font-mono text-ink">{env.SCHOOL_DOMAIN}/check-result</span>, with no account
          needed. A card locks to the first student it&rsquo;s used for and works for every term of its session.
        </p>
      </div>

      <section className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Buy cards</h2>
        <BuyCardsForm />
      </section>

      <Tabs defaultValue="cards">
        <TabsList>
          <TabsTrigger value="cards">Card stock</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>
        <TabsContent value="cards" className="pt-3">
          <CardsTable />
        </TabsContent>
        <TabsContent value="purchases" className="pt-3">
          <PurchasesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
