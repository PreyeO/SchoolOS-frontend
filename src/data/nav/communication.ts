import { Radio, Megaphone, MessageSquare, MessageCircle, CalendarDays } from "lucide-react";

import { adminItem, staffItem, type NavGroup, type Persona } from "./types";

// The one nav audience no factory covers: everyone a notice can be addressed to.
// AnnouncementsPage already serves both halves from this single route — manage
// plus read for a post_notices holder, and a server-filtered inbox for everyone
// else (announcements/services.py filters by audience_personas overlap), so a
// parent or student opening it gets only what was aimed at them.
const NOTICE_AUDIENCE: Persona[] = ["admin", "teacher", "parent", "student"];

export const communicationGroup: NavGroup = {
  label: "Communication",
  icon: Radio,
  items: [
    {
      label: "Announcements",
      href: "/announcements",
      icon: Megaphone,
      description: "Broadcast announcements to staff, parents, and students in one place.",
      personas: NOTICE_AUDIENCE,
      soon: false,
    },
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
