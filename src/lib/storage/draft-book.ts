// Unsaved work kept on the device, so walking between classrooms — or a browser
// discarding a backgrounded tab — doesn't lose it. Only *unsaved* work lives
// here: once the server accepts an entry its draft is dropped, because the query
// cache is then the better copy.
//
// Extracted from the attendance register store so score entry gets the same
// guarantees rather than a second, subtly different copy. Each caller supplies
// its own key prefix, so the two books never collide.

interface StoredDraft<T> {
  entries: Record<string, T>;
  // When the teacher last touched it, used to sweep abandoned drafts.
  updatedAt: number;
}

// One record per membership holding every open draft, rather than a key per
// sheet. A key per sheet would accumulate silently forever; a single book can be
// pruned whenever it's written.
type Book<T> = Record<string, StoredDraft<T>>;

// Matches the offline window elsewhere: past a week the refresh token has
// expired, so unsaved work from before then can't be submitted anyway.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface DraftBook<T> {
  read: (membershipId: string | null | undefined, key: string) => Record<string, T> | null;
  write: (membershipId: string | null | undefined, key: string, entries: Record<string, T>) => void;
  clear: (membershipId: string | null | undefined, key: string) => void;
  clearAll: () => void;
}

export function createDraftBook<T>(keyPrefix: string): DraftBook<T> {
  const storageKey = (membershipId: string | null | undefined) =>
    `${keyPrefix}:${membershipId ?? "anonymous"}`;

  function readBook(membershipId: string | null | undefined): Book<T> {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(storageKey(membershipId));
      return raw ? (JSON.parse(raw) as Book<T>) : {};
    } catch {
      // Unparseable or unavailable. Treat as empty rather than throwing on a
      // read path the editor depends on.
      return {};
    }
  }

  function writeBook(membershipId: string | null | undefined, book: Book<T>): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey(membershipId), JSON.stringify(book));
    } catch {
      // Over quota, or storage disabled. Losing draft persistence is
      // recoverable; throwing here would break the editing itself.
    }
  }

  function prune(book: Book<T>): Book<T> {
    const cutoff = Date.now() - MAX_AGE_MS;
    const kept: Book<T> = {};
    Object.entries(book).forEach(([key, draft]) => {
      if (draft.updatedAt >= cutoff) kept[key] = draft;
    });
    return kept;
  }

  return {
    read(membershipId, key) {
      const draft = readBook(membershipId)[key];
      if (!draft) return null;
      // An abandoned draft is worse than none: it would silently reinstate
      // entries the teacher has long forgotten making, over fresher server data.
      if (Date.now() - draft.updatedAt > MAX_AGE_MS) return null;
      return draft.entries;
    },

    write(membershipId, key, entries) {
      const book = prune(readBook(membershipId));
      book[key] = { entries, updatedAt: Date.now() };
      writeBook(membershipId, book);
    },

    clear(membershipId, key) {
      const book = readBook(membershipId);
      if (!(key in book)) return;
      delete book[key];
      writeBook(membershipId, book);
    },

    // Logout. Every membership's drafts go, not just the current one — a shared
    // staffroom device shouldn't keep one teacher's unsaved work for the next
    // person to sign in.
    clearAll() {
      if (typeof window === "undefined") return;
      try {
        Object.keys(window.localStorage)
          .filter((key) => key.startsWith(keyPrefix))
          .forEach((key) => window.localStorage.removeItem(key));
      } catch {
        // Storage unavailable — nothing to clear.
      }
    },
  };
}
