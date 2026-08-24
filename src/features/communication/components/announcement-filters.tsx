"use client";

import { Select } from "@/components/ui/select";

import { ANNOUNCEMENT_AUDIENCES } from "../lib/audiences";
import { ANNOUNCEMENT_CATEGORIES } from "../lib/categories";

interface Props {
  audience: string;
  onAudienceChange: (next: string) => void;
  category: string;
  onCategoryChange: (next: string) => void;
}

// Manager-only. Everyone else's list is already narrowed by the server to
// notices aimed at them, so there'd be nothing for these to reveal.
//
// Two different questions: who did we tell, and what kind of thing was it.
// Both run client-side — see the comment on `visible` in AnnouncementsPage for
// why category doesn't use the backend's ?category= filter.
export function AnnouncementFilters({
  audience,
  onAudienceChange,
  category,
  onCategoryChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <label className="flex items-center gap-2">
        <span className="text-n-500">Audience</span>
        <Select
          value={audience}
          onChange={(e) => onAudienceChange(e.target.value)}
          aria-label="Filter by audience"
          className="min-w-36"
        >
          <option value="">Anyone</option>
          {ANNOUNCEMENT_AUDIENCES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex items-center gap-2">
        <span className="text-n-500">Kind</span>
        <Select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by kind of notice"
          className="min-w-36"
        >
          <option value="">Any kind</option>
          {ANNOUNCEMENT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
}
