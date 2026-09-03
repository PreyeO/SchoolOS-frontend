import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { PRIVACY_POLICY } from "@/data/legal/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How SchoolOS handles personal information for parents, students, teachers and school staff.",
};

export default function Page() {
  return <LegalPage doc={PRIVACY_POLICY} />;
}
