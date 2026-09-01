"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

import { getPlatformPeople, type PeopleKind } from "../api/platform-people-api";
import { usePlatformSchools } from "../hooks/use-platform";
import { PlatformPersonRow } from "./platform-person-row";

const TABS: { value: PeopleKind; label: string }[] = [
  { value: "students", label: "Students" },
  { value: "teachers", label: "Teachers" },
  { value: "parents", label: "Parents" },
  { value: "admins", label: "Admins" },
];

// Browse any school's people, for support.
//
// A school must be chosen. That's a backend limitation surfaced honestly
// rather than worked around: the four directory serializers don't include the
// person's school, so a merged cross-school list would show names with no way
// to tell which school each belongs to. Picking a school first means every row
// on screen has a known context.
export function PlatformPeoplePage() {
  const { data: schools, isPending: schoolsLoading } = usePlatformSchools();
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [kind, setKind] = useState<PeopleKind>("students");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 300);

  const selectedId = schoolId ?? schools?.[0]?.id ?? null;

  const query = useQuery({
    queryKey: ["platform", "people", kind, selectedId, debounced],
    queryFn: () => getPlatformPeople(kind, selectedId as string, debounced || undefined),
    enabled: !!selectedId,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Directory</h1>
        <p className="mt-1 text-sm text-n-500">
          Look up anyone at a school — students, staff, parents and admins.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-ink">School</span>
          <Select
            value={selectedId ?? ""}
            onChange={(e) => setSchoolId(e.target.value)}
            disabled={schoolsLoading}
            className="min-w-56"
          >
            {(schools ?? []).map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </Select>
        </label>

        <div className="relative min-w-52 flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-n-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={kind === "students" ? "Search by admission number…" : "Search by name or email…"}
            className="pl-9"
            aria-label="Search people"
          />
        </div>
      </div>

      <Tabs value={kind} onValueChange={(v) => setKind(v as PeopleKind)}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.value === "students" && (
              <p className="mb-3 rounded-lg border border-n-200 bg-n-50 px-3 py-2 text-xs text-n-500">
                Students are listed by admission number and class only. Most are minors, and
                supporting a school doesn&rsquo;t require knowing a child&rsquo;s name.
              </p>
            )}
            {query.isPending ? (
              <p className="text-sm text-n-400" role="status">Loading…</p>
            ) : query.isError ? (
              <ErrorState error={query.error} resourceLabel={tab.label.toLowerCase()} />
            ) : query.data.people.length === 0 ? (
              <p className="rounded-xl border border-n-200 bg-white p-8 text-center text-sm text-n-400 italic">
                {debounced
                  ? `No ${tab.label.toLowerCase()} match that search.`
                  : `No ${tab.label.toLowerCase()} at this school.`}
              </p>
            ) : (
              <>
                <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
                  {query.data.people.map((person) => (
                    <PlatformPersonRow key={person.id} person={person} kind={tab.value} />
                  ))}
                </ul>
                {query.data.total > query.data.people.length && (
                  <p className="mt-2 text-xs text-n-400">
                    Showing {query.data.people.length} of {query.data.total} — narrow with
                    search.
                  </p>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
