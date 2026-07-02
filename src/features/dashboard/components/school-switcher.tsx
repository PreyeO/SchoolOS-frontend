"use client";

import { ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSchoolStore } from "@/stores/school-store";
import { SchoolLogo } from "./school-logo";

// MOCK — replace with the user's real school memberships once the multi-school
// membership endpoint is available.
function getMockOtherSchools(currentSlug?: string) {
  return [{ name: "Bright Kids Academy", slug: "bright-kids" }, { name: "Falcon International", slug: "falcon-intl" }].filter(
    (s) => s.slug !== currentSlug,
  );
}

export function SchoolSwitcher() {
  const school = useSchoolStore((s) => s.currentSchool);
  const otherSchools = getMockOtherSchools(school?.slug);

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
            onClick={() => toast.info("Multi-school switching is coming soon.")}
          >
            {s.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
