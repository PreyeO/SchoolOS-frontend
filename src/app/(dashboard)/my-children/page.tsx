import type { Metadata } from "next";

import { MyChildrenPage } from "@/features/parent/components/my-children-page";

export const metadata: Metadata = { title: "My Children — SchoolOS" };

export default function Page() {
  return <MyChildrenPage />;
}
