"use client";

import { Bell } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "../hooks/use-notifications";

export function NotificationBell() {
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => n.unread).length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-clay" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5 whitespace-normal">
              <span className="text-foreground">{n.text}</span>
              <span className="text-xs text-muted-foreground">{n.timestamp}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="px-2 py-3 text-sm text-muted-foreground">No new notifications.</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
