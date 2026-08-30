import type { Metadata } from "next";

import { ChildProfilePage } from "@/features/parent/components/child-profile-page";

export const metadata: Metadata = { title: "Child profile" };

export default function Page() {
  return <ChildProfilePage />;
}
