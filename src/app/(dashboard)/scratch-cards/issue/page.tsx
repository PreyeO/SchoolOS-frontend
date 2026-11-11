import type { Metadata } from "next";

import { IssueCardsPage, type IssuePrefill } from "@/features/scratch-cards/components/issue/issue-cards-page";

export const metadata: Metadata = { title: "Issue Result Cards" };

// Resolves to the Result Cards nav item by prefix, so it's gated on
// manage_scratch_cards like the rest of /scratch-cards.
//
// The overview links here pre-filled: ?scope=school&session=…&check=1 ("send
// to everyone waiting") or ?student=…&name=…&adm=…&session=…&check=1 (one
// student). Read server-side and passed down; anything else is ignored.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const one = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : undefined);
  const student = one("student");
  const prefill: IssuePrefill = {
    sessionId: one("session"),
    scope: student ? "selection" : one("scope") === "school" ? "school" : undefined,
    student: student ? { id: student, name: one("name") ?? "This student", admission_number: one("adm") ?? "" } : undefined,
    check: one("check") === "1",
  };
  return <IssueCardsPage prefill={prefill} />;
}
