import { Radio, Megaphone, MessageSquare, MessageCircle, CalendarDays } from "lucide-react";

import { adminItem, staffItem, type NavGroup } from "./types";

export const communicationGroup: NavGroup = {
  label: "Communication",
  icon: Radio,
  items: [
    staffItem({
      label: "Announcements",
      href: "/announcements",
      icon: Megaphone,
      description: "Broadcast announcements to staff, parents, and students in one place.",
    }),
    staffItem({
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
      description: "Message individual parents, staff, or students directly in-app.",
    }),
    // Bulk SMS/WhatsApp is a billed, school-wide broadcast — an admin decision,
    // not something an individual teacher sends.
    adminItem({
      label: "SMS & WhatsApp",
      href: "/messaging",
      icon: MessageCircle,
      description: "Send bulk SMS and WhatsApp updates for fees, results, and events.",
    }),
    staffItem({
      label: "Events & Calendar",
      href: "/calendar",
      icon: CalendarDays,
      description: "Plan and share the school calendar — terms, holidays, and events.",
    }),
  ],
};
