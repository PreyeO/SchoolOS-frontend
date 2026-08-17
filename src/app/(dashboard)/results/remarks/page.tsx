import type { Metadata } from "next";

import { PrincipalRemarksPage } from "@/features/results/components/principal-remarks-page";

export const metadata: Metadata = { title: "Principal's remarks — SchoolOS" };

export default function Page() {
  return <PrincipalRemarksPage />;
}
