import type { Metadata } from "next";

import { MyFeesPage } from "@/features/student/components/my-fees-page";

export const metadata: Metadata = { title: "My fees" };

export default function Page() {
  return <MyFeesPage />;
}
