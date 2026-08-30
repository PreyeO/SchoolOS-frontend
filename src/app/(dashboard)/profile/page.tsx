import type { Metadata } from "next";
import { UserRound } from "lucide-react";

import { ComingSoon } from "@/features/dashboard/components/coming-soon";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <ComingSoon
      href="/profile"
      label="Profile"
      description="Manage your personal account details, password, and notification preferences."
      icon={UserRound}
    />
  );
}
