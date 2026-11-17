// Where a send page's back link goes. The page is reached from three places,
// and a fixed "← Result cards" dumped people who came from Records → Past
// sends back on the overview (reported 2026-11-11). Each link INTO a send
// page says where it came from (?from=…), and this maps that back.
// Plain module (no "use client"): the server route reads it.

export type BatchOrigin = { from: "records" } | { from: "student"; studentId: string } | { from: "home" };

export function batchHref(batchId: string, origin: BatchOrigin = { from: "home" }): string {
  const base = `/scratch-cards/batches/${batchId}`;
  if (origin.from === "records") return `${base}?from=records`;
  if (origin.from === "student") return `${base}?from=student&student=${origin.studentId}`;
  return base;
}

// Reads ?from= back. Anything unexpected falls back to the overview.
export function parseBatchOrigin(from: string | undefined, studentId: string | undefined): BatchOrigin {
  if (from === "records") return { from: "records" };
  if (from === "student" && studentId) return { from: "student", studentId };
  return { from: "home" };
}

export function backLink(origin: BatchOrigin): { href: string; label: string } {
  if (origin.from === "records") return { href: "/scratch-cards/records?tab=sends", label: "Records" };
  if (origin.from === "student") return { href: `/students/${origin.studentId}`, label: "Back to the student" };
  return { href: "/scratch-cards", label: "Result cards" };
}
