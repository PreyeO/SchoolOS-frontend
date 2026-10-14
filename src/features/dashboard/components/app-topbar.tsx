"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { findNavItemForPath } from "@/data/navigation";
import { useSchoolStore } from "@/stores/school-store";
import { useNavGroups } from "../hooks/use-nav-groups";
import { useSidebarAccordion } from "../hooks/use-sidebar-accordion";
import { SidebarNavGroup } from "./sidebar-nav-group";
import { SchoolLogo } from "./school-logo";
import { SyncIndicator } from "./sync-indicator";
import { TermChip } from "./term-chip";
import { SchoolSwitcher } from "./school-switcher";
import { UserMenu } from "./user-menu";

// Search and notifications are out of the MVP and no longer rendered here.
// Both components are kept in this folder rather than deleted, so switching
// them back on is re-adding two lines.
//
// Neither did anything anyway, which is the better reason to take them off the
// header: TopbarSearch was an input with no handler and no results behind it,
// plus a ⌘K shortcut that focused it, and the bell's feed was hardcoded copy
// before it was emptied. A control that invites a click and then does nothing
// costs more trust than the empty space costs.

// Pages reachable from somewhere other than the sidebar, and so absent from the
// nav registry that supplies every other title.
const OFF_NAV_TITLES: Record<string, string> = {
  "/profile": "Profile",
};

// The drawer's open state lives in DashboardShell, not here: the phone bottom
// bar's "More" tab opens this same drawer.
export function AppTopbar({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const school = useSchoolStore((s) => s.currentSchool);
  const navGroups = useNavGroups();
  const { openGroup, toggleGroup } = useSidebarAccordion(navGroups, pathname);

  // findNavItemForPath, not getNavItemByHref: the latter matches the href
  // exactly, so every detail route fell through to "Dashboard" — /students/<id>
  // was headed "Dashboard" while the sidebar highlighted Students. Prefix
  // matching (longest wins) resolves it to the item that governs the route,
  // which is the same rule the sidebar highlight already used.
  const pageTitle = OFF_NAV_TITLES[pathname] ?? findNavItemForPath(pathname)?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background px-4 lg:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        <SheetContent side="left" data-surface="ink" className="w-72 p-0 border-none">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-14 items-center gap-2.5 px-4 border-b border-border">
            <SchoolLogo school={school} className="size-7" />
            <span className="font-display font-semibold text-sm text-foreground truncate">
              {school?.name ?? "SchoolOS"}
            </span>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-2">
            {navGroups.map((group) => (
              <SidebarNavGroup
                key={group.label}
                group={group}
                pathname={pathname}
                collapsed={false}
                isOpen={openGroup === group.label}
                onToggle={() => toggleGroup(group.label)}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <h1 className="font-display font-semibold text-base text-ink truncate">{pageTitle}</h1>

      {/* ml-auto still does the work that TopbarSearch's flex-1 used to: the
          title stays left, these stay right. */}
      <div className="ml-auto flex items-center gap-2">
        <SyncIndicator />
        <TermChip />
        <SchoolSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
