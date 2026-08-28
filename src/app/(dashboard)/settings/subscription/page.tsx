import type { Metadata } from "next";

import { SubscriptionPage } from "@/features/settings/components/subscription-page";

export const metadata: Metadata = { title: "Subscription & Billing — SchoolOS" };

export default function Page() {
  return <SubscriptionPage />;
}
