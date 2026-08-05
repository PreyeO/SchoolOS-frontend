"use client";

import { ChevronsUpDown, Check, Loader2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSchoolStore } from "@/stores/school-store";
import { useMySchools } from "../hooks/use-my-schools";
import { useSwitchSchool } from "../hooks/use-switch-school";
import { SchoolLogo } from "./school-logo";

// Other schools' list items only carry a plain logo URL (no brand colors —
// GET /api/schools/'s summary shape omits those), so they get a plain
// gray-on-initial avatar here rather than SchoolLogo's brand-colored one,
// which needs the fuller CurrentSchool shape this list doesn't provide.
function OtherSchoolAvatar({ name, logo }: { name: string; logo: string | null }) {
  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt={name} className="size-5 shrink-0 rounded object-cover" />;
  }
  return (
    <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
      {name[0]?.toUpperCase() ?? "S"}
    </div>
  );
}

export function SchoolSwitcher() {
  const school = useSchoolStore((s) => s.currentSchool);
  const { data: schools } = useMySchools();
  const switchSchool = useSwitchSchool();

  const otherSchools = (schools ?? []).filter((s) => s.slug !== school?.slug);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-sm hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SchoolLogo school={school} className="size-5 text-[10px]" />
          <span className="max-w-32 truncate font-medium text-foreground">
            {school?.name ?? "SchoolOS"}
          </span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Your schools</DropdownMenuLabel>
        <DropdownMenuItem disabled className="justify-between">
          {school?.name ?? "This school"}
          <Check className="size-4 text-primary" />
        </DropdownMenuItem>
        {otherSchools.length > 0 && <DropdownMenuSeparator />}
        {otherSchools.map((s) => (
          <DropdownMenuItem
            key={s.slug}
            disabled={switchSchool.isPending}
            onClick={() => switchSchool.mutate(s.slug)}
            className="gap-2"
          >
            <OtherSchoolAvatar name={s.name} logo={s.logo} />
            <span className="truncate">{s.name}</span>
            {switchSchool.isPending && switchSchool.variables === s.slug && (
              <Loader2 className="ml-auto size-3.5 shrink-0 animate-spin text-muted-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
