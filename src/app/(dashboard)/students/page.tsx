import type { Metadata } from "next";

export const metadata: Metadata = { title: "Students — SchoolOS" };

export default function StudentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Students</h1>
      <p className="text-n-500">Student management coming soon.</p>
    </div>
  );
}
