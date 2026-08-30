import type { Metadata } from "next";

import { TraitSettingsPage } from "@/features/results/components/trait-settings-page";

export const metadata: Metadata = { title: "Behaviour traits" };

export default function Page() {
  return <TraitSettingsPage />;
}
