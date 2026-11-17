"use client";

import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactsPanel } from "@/features/guardian-contacts/components/contacts-panel";

import type { RecordTab } from "../lib/record-tabs";
import { CardsTable } from "./cards-table";
import { PurchasesTable } from "./purchases-table";
import { BatchesList } from "./sent/batches-list";

// /scratch-cards/records: the history and housekeeping behind Result cards,
// on a page of its own. It used to sit under the student list, where filtering
// the list (e.g. "Need a number") pulled it up so it read as part of the list.
// ?tab= opens a given tab, so other screens can link straight to one.
export function RecordsPage({ tab = "sends" }: { tab?: RecordTab }) {
  return (
    <div className="space-y-5">
      <Link href="/scratch-cards" className="text-sm text-primary hover:underline">← Result cards</Link>
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Result card records</h1>
        <p className="mt-1 max-w-2xl text-sm text-n-500">
          Every send, parents&rsquo; numbers, every card by serial, and what the school has bought.
        </p>
      </div>
      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="sends">Past sends</TabsTrigger>
          <TabsTrigger value="numbers">Parent numbers</TabsTrigger>
          <TabsTrigger value="cards">Every card</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>
        <TabsContent value="sends" className="pt-3"><BatchesList /></TabsContent>
        <TabsContent value="numbers" className="pt-3"><ContactsPanel /></TabsContent>
        <TabsContent value="cards" className="pt-3"><CardsTable /></TabsContent>
        <TabsContent value="purchases" className="pt-3"><PurchasesTable /></TabsContent>
      </Tabs>
    </div>
  );
}
