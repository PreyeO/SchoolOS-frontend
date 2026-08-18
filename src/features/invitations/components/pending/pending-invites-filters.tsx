import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { InvitePersona, InviteStatus } from "../../types";
import { personaLabel } from "../../lib/persona-label";

const STATUS_TABS: { value: InviteStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "invalidated", label: "Invalidated" },
  { value: "expired", label: "Expired" },
];

// No "student". UserService.invite_student creates the account outright and
// hands back a password — it never writes an InviteToken, so that filter could
// only ever return nothing. Confirmed in code and against live data: every token
// in the table is admin, teacher or parent.
const PERSONAS: InvitePersona[] = ["admin", "teacher", "parent"];

interface Props {
  status: InviteStatus | "all";
  onStatusChange: (status: InviteStatus | "all") => void;
  persona: InvitePersona | "all";
  onPersonaChange: (persona: InvitePersona | "all") => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function PendingInvitesFilters({
  status,
  onStatusChange,
  persona,
  onPersonaChange,
  search,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onStatusChange(tab.value)}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors",
              status === tab.value
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-n-200 text-n-500 hover:border-n-300",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Select
        aria-label="Filter by persona"
        value={persona}
        onChange={(e) => onPersonaChange(e.target.value as InvitePersona | "all")}
        className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
      >
        <option value="all">All roles</option>
        {PERSONAS.map((p) => (
          <option key={p} value={p}>
            {personaLabel(p)}
          </option>
        ))}
      </Select>

      <Input
        placeholder="Search by email…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="ml-auto h-9 max-w-xs"
      />
    </div>
  );
}
