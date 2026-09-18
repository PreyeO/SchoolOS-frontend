"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERSONA_LABELS, type SwitchablePersona } from "@/lib/auth/active-persona";
import {
  useActivePersona,
  useAvailablePersonas,
  useSetActivePersona,
} from "@/lib/auth/use-active-persona";
import { useAuthStore } from "@/stores/auth-store";
import { useSchoolStore } from "@/stores/school-store";

export function UserMenu() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearSchool = useSchoolStore((s) => s.clearSchool);
  const activePersona = useActivePersona();
  const availablePersonas = useAvailablePersonas();
  const setActivePersona = useSetActivePersona();

  function handleLogout() {
    clearAuth();
    clearSchool();
    router.push("/login");
  }

  // Sends them to the dashboard home for the new persona rather than leaving
  // them on whatever page they were standing on — the sidebar and route guard
  // are scoped to the new persona the instant this runs, and the page under
  // them may no longer be one that persona can open.
  function handleSwitch(value: string) {
    const persona = value as SwitchablePersona;
    if (persona === activePersona) return;
    setActivePersona(persona);
    router.push("/dashboard");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              <UserRound className="size-4" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {/* Always shown, even for a member who currently holds only one
            persona — so the row doesn't appear out of nowhere the day a
            second one is granted, and "which profile am I in" is always
            answerable from here. Named "Working as" rather than "Profile" so
            it doesn't read as the same thing as the Profile link below, which
            is the personal-details page, not this. */}
        <DropdownMenuLabel>Working as</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={activePersona} onValueChange={handleSwitch}>
          {availablePersonas.map((persona) => (
            <DropdownMenuRadioItem key={persona} value={persona}>
              {PERSONA_LABELS[persona]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRound /> Profile
          </Link>
        </DropdownMenuItem>
        {/* No Settings entry: the sidebar's Settings group is the way there,
            and this pointed only at School Profile regardless. */}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
