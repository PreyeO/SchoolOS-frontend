import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { DATA_PROTECTION_POLICY } from "@/data/legal/data-protection";

export const metadata: Metadata = {
  title: "Data Protection Policy",
  description:
    "How SchoolOS protects the information a school entrusts to it, under the Nigeria Data Protection Act 2023.",
};

export default function Page() {
  return <LegalPage doc={DATA_PROTECTION_POLICY} />;
}
