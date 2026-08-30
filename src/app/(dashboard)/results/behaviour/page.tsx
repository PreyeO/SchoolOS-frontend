import type { Metadata } from "next";

import { BehaviourPage } from "@/features/results/components/behaviour-page";

export const metadata: Metadata = { title: "Behaviour ratings" };

export default function Page() {
  return <BehaviourPage />;
}
