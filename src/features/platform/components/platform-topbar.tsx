"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { PersonAvatar } from "@/components/shared/person-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";

import { useCurrentPlatformAdmin } from "../hooks/use-platform";

// Minimal by necessity. The school topbar carries a school switcher, a term
// chip, a sync indicator and a notification bell — every one of which is
// school-scoped and either renders empty or fires a request that 403s for a
// platform admin. None of them are here.
//
// clearAuth() now clears the school store too, so there's no separate
// clearSchool() call as UserMenu still makes.
export function PlatformTopbar() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { admin } = useCurrentPlatformAdmin();

  const name = admin ? `${admin.user.first_name} ${admin.user.last_name}` : "";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-n-200 bg-white px-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-n-400">
        SchoolOS staff
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open account menu"
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PersonAvatar
              firstName={admin?.user.first_name ?? "?"}
              lastName={admin?.user.last_name ?? ""}
              className="size-8"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>
            <span className="block truncate text-sm text-ink">{name || "Platform admin"}</span>
            <span className="block truncate text-xs font-normal text-n-500">
              {admin?.user.email}
            </span>
            {admin?.platform_admin_role && (
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {admin.platform_admin_role.name}
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              clearAuth();
              router.push("/login");
            }}
            className="gap-2"
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
