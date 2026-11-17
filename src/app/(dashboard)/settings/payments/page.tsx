import type { Metadata } from "next";

import { WalletPage } from "@/features/wallet/components/wallet-page";

export const metadata: Metadata = { title: "SMS Wallet" };

export default function Page() {
  return <WalletPage />;
}
