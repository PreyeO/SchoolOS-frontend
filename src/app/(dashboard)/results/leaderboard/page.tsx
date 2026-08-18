import type { Metadata } from "next";

import { LeaderboardPage } from "@/features/results/components/leaderboard-page";

export const metadata: Metadata = { title: "Leaderboard — SchoolOS" };

export default function Page() {
  return <LeaderboardPage />;
}
