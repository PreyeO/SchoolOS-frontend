import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payments — SchoolOS" };

export default function PaymentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Payments</h1>
      <p className="text-n-500">Payment records coming soon.</p>
    </div>
  );
}
