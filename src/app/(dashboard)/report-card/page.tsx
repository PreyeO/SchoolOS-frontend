import type { Metadata } from "next";

export const metadata: Metadata = { title: "Report Cards — SchoolOS" };

export default function ReportCardPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Report Cards</h1>
      <p className="text-n-500">Report card management coming soon.</p>
    </div>
  );
}
