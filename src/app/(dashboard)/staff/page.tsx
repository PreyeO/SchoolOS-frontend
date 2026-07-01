import type { Metadata } from "next";

export const metadata: Metadata = { title: "Staff — SchoolOS" };

export default function StaffPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Staff</h1>
      <p className="text-n-500">Staff management coming soon.</p>
    </div>
  );
}
