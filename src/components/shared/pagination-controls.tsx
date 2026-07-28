"use client";

import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  pageSize: number;
  count: number;
  onPageChange: (page: number) => void;
}

// Shared across the Staff/Student/Parent directories — unlike the bounded
// Settings lists (a handful of sessions/classes), these can genuinely run
// into the hundreds, so real page navigation matters here.
export function PaginationControls({ page, pageSize, count, onPageChange }: Props) {
  if (count <= pageSize) return null;

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, count);

  return (
    <div className="flex items-center justify-between gap-3 text-sm text-n-500">
      <p>
        Showing {start}–{end} of {count}
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="text-xs text-n-400">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
