"use client";

import { useState } from "react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { NavGroup, NavItem } from "@/data/navigation";
import { isNavActive } from "../lib/is-nav-active";

interface Props {
  group: NavGroup;
  pathname: string;
  hasActiveChild: boolean;
  onNavigate?: () => void;
}

function FlyoutLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const ItemIcon = item.icon;
  const active = isNavActive(item.href, pathname);
  return (
    <DropdownMenuItem asChild>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn("gap-2", active && "bg-muted font-medium text-foreground")}
      >
        <ItemIcon className="size-4" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.soon && <span className="text-[10px] text-muted-foreground">Soon</span>}
      </Link>
    </DropdownMenuItem>
  );
}

export function SidebarGroupFlyout({ group, pathname, hasActiveChild, onNavigate }: Props) {
  const [open, setOpen] = useState(false);
  const Icon = group.icon;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={group.label}
          onMouseEnter={() => setOpen(true)}
          className={cn(
            "flex w-full items-center justify-center rounded-lg py-2 transition-colors",
            hasActiveChild ? "bg-muted text-foreground" : "text-foreground/50 hover:bg-muted/60 hover:text-foreground",
          )}
        >
          <Icon className="size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={10} className="w-56">
        <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
        {group.items.map((item) =>
          // A grouped item (see groupedItem in data/nav/types) has no page of
          // its own to link to, so the flyout can't nest a second disclosure
          // level inside this one — its children are listed directly, under
          // their own sub-label rather than silently merged into the group's.
          item.items ? (
            <div key={item.label}>
              <DropdownMenuLabel className="pt-1.5 text-[10px] text-muted-foreground">
                {item.label}
              </DropdownMenuLabel>
              {item.items.map((child) => (
                <FlyoutLink key={child.href} item={child} pathname={pathname} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <FlyoutLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
