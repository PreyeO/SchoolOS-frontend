import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fees — SchoolOS" };

export default function FeesPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Fees</h1>
      <p className="text-n-500">Fee management coming soon.</p>
    </div>
  );
}
