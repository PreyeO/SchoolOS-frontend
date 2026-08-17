import type { Metadata } from "next";

import { TraitSettingsPage } from "@/features/results/components/trait-settings-page";

export const metadata: Metadata = { title: "Behaviour traits — SchoolOS" };

export default function Page() {
  return <TraitSettingsPage />;
}
