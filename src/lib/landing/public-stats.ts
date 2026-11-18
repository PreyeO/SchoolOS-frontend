import { env } from "@/config/env";
import { SCHOOL_ENDPOINTS } from "@/lib/api/endpoints/auth";

// Live headcounts for the landing page's "Trusted by schools" line, from the
// public stats endpoint (backend cb9e018), in place of figures typed by hand.
//
// Fetched on the server with time-based revalidation, so the landing page
// stays a cached static page and refreshes at most hourly (the backend caches
// its totals for an hour too, so asking more often buys nothing). Plain fetch,
// not apiClient: this runs on the server, with no session to attach.
//
// Only the totals are used. The endpoint also lists every school with a logo,
// but that includes schools that never agreed to be named, and its logo URLs
// are presigned for an hour, which a cached page would outlive. The crests on
// the page stay the hand-picked set in data/landing.ts.

export interface PublicTotals {
  schools: number;
  students: number;
  teachers: number;
  school_admins: number;
}

const REVALIDATE_SECONDS = 60 * 60;
// A slow API must never hold up the landing page's build or revalidation.
const TIMEOUT_MS = 5000;

function isTotals(value: unknown): value is PublicTotals {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return ["schools", "students", "teachers", "school_admins"].every(
    (k) => typeof t[k] === "number" && Number.isFinite(t[k] as number) && (t[k] as number) >= 0,
  );
}

// null on any failure (unset base URL, network, non-2xx, unexpected shape);
// the caller falls back to the last hand-typed figures.
export async function getPublicTotals(): Promise<PublicTotals | null> {
  const base = env.API_BASE_URL;
  if (!base) return null;
  try {
    const response = await fetch(`${base}${SCHOOL_ENDPOINTS.PUBLIC_STATS()}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    const totals = (body as { totals?: unknown } | null)?.totals;
    return isTotals(totals) ? totals : null;
  } catch {
    return null;
  }
}

// "980+" for 983: a public claim should never round up, so large figures are
// floored to the nearest ten and marked "+". Small ones are exact, where a
// "+" would read as hedging ("45 staff", not "40+ staff").
export function formatAtLeast(n: number): string {
  if (n < 100) return String(n);
  return `${(Math.floor(n / 10) * 10).toLocaleString("en-NG")}+`;
}

export interface HeadlinePart {
  text: string;
  strong?: boolean;
}

// "980+ students and 45 staff are already on SchoolOS." Staff is teachers
// plus school admins, the same two figures the platform overview shows.
export function buildHeadline(totals: Pick<PublicTotals, "students" | "teachers" | "school_admins">): HeadlinePart[] {
  const staff = totals.teachers + totals.school_admins;
  return [
    { text: `${formatAtLeast(totals.students)} ${totals.students === 1 ? "student" : "students"}`, strong: true },
    { text: " and " },
    { text: `${formatAtLeast(staff)} staff`, strong: true },
    { text: " are already on SchoolOS." },
  ];
}
