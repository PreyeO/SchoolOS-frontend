"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

interface Props<T> {
  queryKey: string;
  search: (query: string) => Promise<T[]>;
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  getSubLabel: (item: T) => string;
  onSelect: (item: T) => void;
  placeholder: string;
}

// Generic "find and pick a person" control — used by the parent-student
// linking dialogs on both the Student and Parent detail pages, searching
// whichever directory (getParents/getStudents) the caller passes in.
export function PersonSearchSelect<T>({
  queryKey,
  search,
  getId,
  getLabel,
  getSubLabel,
  onSelect,
  placeholder,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const trimmed = debouncedQuery.trim();

  const { data, isFetching } = useQuery({
    queryKey: [queryKey, "search", trimmed],
    queryFn: () => search(trimmed),
    enabled: trimmed.length >= 2,
  });

  return (
    <div className="space-y-2">
      <Input placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
      {trimmed.length >= 2 && (
        <div className="max-h-48 overflow-y-auto rounded-lg border border-n-200">
          {isFetching ? (
            <p className="px-3 py-2 text-sm text-n-400">Searching…</p>
          ) : data && data.length > 0 ? (
            <ul>
              {data.map((item) => (
                <li key={getId(item)}>
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="flex w-full cursor-pointer flex-col items-start px-3 py-2 text-left hover:bg-n-50"
                  >
                    <span className="text-sm text-ink">{getLabel(item)}</span>
                    <span className="text-xs text-n-400">{getSubLabel(item)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-sm text-n-400 italic">No matches.</p>
          )}
        </div>
      )}
    </div>
  );
}
