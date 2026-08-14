"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getNavItemByHref } from "@/data/navigation";
import { useSchoolStore } from "@/stores/school-store";
import { useNavGroups } from "../hooks/use-nav-groups";
import { useSidebarAccordion } from "../hooks/use-sidebar-accordion";
import { SidebarNavGroup } from "./sidebar-nav-group";
import { SchoolLogo } from "./school-logo";
import { TopbarSearch } from "./topbar-search";
import { SyncIndicator } from "./sync-indicator";
import { TermChip } from "./term-chip";
import { NotificationBell } from "./notification-bell";
import { SchoolSwitcher } from "./school-switcher";
import { UserMenu } from "./user-menu";

export function AppTopbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const school = useSchoolStore((s) => s.currentSchool);
  const navGroups = useNavGroups();
  const { openGroup, toggleGroup } = useSidebarAccordion(navGroups, pathname);

  const pageTitle = getNavItemByHref(pathname)?.label ?? "Dashboard";

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

      <TopbarSearch />

      <div className="ml-auto flex items-center gap-2">
        <SyncIndicator />
        <TermChip />
        <NotificationBell />
        <SchoolSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
