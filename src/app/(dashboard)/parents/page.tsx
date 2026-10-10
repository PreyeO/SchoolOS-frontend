import type { Metadata } from "next";

import { ParentsListPage } from "@/features/parents/components/parents-list-page";

export const metadata: Metadata = { title: "Parents & Guardians" };

// ?view=former opens the Former parents tab — where a former parent's detail
// page sends its "Back" link. Read server-side to avoid a Suspense boundary.
export default async function Page({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  return <ParentsListPage initialView={view === "former" ? "former" : "current"} />;
}
