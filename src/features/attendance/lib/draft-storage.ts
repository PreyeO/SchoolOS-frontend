import type { DraftEntry } from "../types";

// Unsaved register edits, kept on the device so walking between classrooms — or
// a browser deciding to discard a backgrounded tab — doesn't lose a half-marked
// register. Only *unsaved* work lives here; once a register is accepted by the
// server its entry is dropped, because the query cache is then the better copy.

interface StoredDraft {
  entries: Record<string, DraftEntry>;
  // When the teacher last touched it, used to sweep abandoned drafts.
  updatedAt: number;
}

// One record per membership holding every open register, rather than a key per
// arm+date. A key per register would accumulate silently forever; a single book
// can be pruned whenever it's written.
type DraftBook = Record<string, StoredDraft>;

const KEY_PREFIX = "schoolos-register-draft";

// Matches the offline window elsewhere: past a week the refresh token has
// expired, so an unsaved draft from before then can't be submitted anyway.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// The compound identity of a register. Arm AND date, because they are two
// different registers — this is what keeps one class's edits from ever being
// attributed to another.
export function draftKey(classArmId: string, date: string): string {
  return `${classArmId}|${date}`;
}

function storageKey(membershipId: string | null | undefined): string {
  return `${KEY_PREFIX}:${membershipId ?? "anonymous"}`;
}

function readBook(membershipId: string | null | undefined): DraftBook {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(membershipId));
    return raw ? (JSON.parse(raw) as DraftBook) : {};
  } catch {
    // Unparseable or unavailable. Treat as empty rather than throwing on a read
    // path the register depends on.
    return {};
  }
}

function writeBook(membershipId: string | null | undefined, book: DraftBook): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(membershipId), JSON.stringify(book));
  } catch {
    // Over quota, or storage disabled. Losing draft persistence is recoverable;
    // throwing here would break marking itself.
  }
}

function prune(book: DraftBook): DraftBook {
  const cutoff = Date.now() - MAX_AGE_MS;
  const kept: DraftBook = {};
  Object.entries(book).forEach(([key, draft]) => {
    if (draft.updatedAt >= cutoff) kept[key] = draft;
  });
  return kept;
}

export function readDraft(
  membershipId: string | null | undefined,
  key: string,
): Record<string, DraftEntry> | null {
  const draft = readBook(membershipId)[key];
  if (!draft) return null;
  // An abandoned draft is worse than none: it would silently reinstate marks the
  // teacher has long forgotten making, over fresher server data.
  if (Date.now() - draft.updatedAt > MAX_AGE_MS) return null;
  return draft.entries;
}

export function writeDraft(
  membershipId: string | null | undefined,
  key: string,
  entries: Record<string, DraftEntry>,
): void {
  const book = prune(readBook(membershipId));
  book[key] = { entries, updatedAt: Date.now() };
  writeBook(membershipId, book);
}

// Called once a register matches the server — there's nothing unsaved left to
// protect, and keeping it would mean re-seeding stale local state next time.
export function clearDraft(membershipId: string | null | undefined, key: string): void {
  const book = readBook(membershipId);
  if (!(key in book)) return;
  delete book[key];
  writeBook(membershipId, book);
}

// Logout. Every membership's drafts go, not just the current one — a shared
// staffroom device shouldn't keep one teacher's unsaved register for the next
// person to sign in.
export function clearAllRegisterDrafts(): void {
  if (typeof window === "undefined") return;
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(KEY_PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage unavailable — nothing to clear.
  }
}
