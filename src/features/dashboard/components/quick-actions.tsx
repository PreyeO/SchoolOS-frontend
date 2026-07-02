import Link from "next/link";
import { UserPlus, Receipt, Megaphone, LayoutGrid } from "lucide-react";

const ACTIONS = [
  { label: "Add Student", href: "/students", icon: UserPlus },
  { label: "Record Payment", href: "/payments", icon: Receipt },
  { label: "Post Announcement", href: "/announcements", icon: Megaphone },
  { label: "Create Class", href: "/classes", icon: LayoutGrid },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ACTIONS.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-2 rounded-xl border border-n-200 bg-white px-3 py-4 text-center hover:border-brand/30 hover:bg-brand/5 transition-colors"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10">
            <Icon className="size-4 text-brand" />
          </div>
          <span className="text-xs font-medium text-ink">{label}</span>
        </Link>
      ))}
    </div>
  );
}
