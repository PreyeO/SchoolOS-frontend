import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { TERMS_OF_SERVICE } from "@/data/legal/terms";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The agreement between SchoolOS and the schools that subscribe to it, and the rules for everyone who uses the platform.",
};

export default function Page() {
  return <LegalPage doc={TERMS_OF_SERVICE} />;
}
