// The Records page's tabs, in a plain module (no "use client") because the
// server route reads it to validate ?tab=. Imported from the client component
// file instead, a server file gets a client-reference stub, not this array
// (RECORD_TABS.find "is not a function"), which is what broke the page.
export const RECORD_TABS = ["sends", "numbers", "cards", "purchases"] as const;
export type RecordTab = (typeof RECORD_TABS)[number];
