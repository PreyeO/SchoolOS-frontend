import { LayoutDashboard, Users2 } from "lucide-react";

import { parentItem, type NavGroup, type Persona } from "./types";

const ALL_PERSONAS: Persona[] = ["admin", "teacher", "parent", "student", "bursar"];

export const overviewGroup: NavGroup = {
  label: "Overview",
  icon: LayoutDashboard,
  items: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Your school's live overview — enrollment, fees, and attendance at a glance.",
      personas: ALL_PERSONAS,
    },
    // A flat item, deliberately not groupedItem(): flattenLeaves drops a
    // wrapper, so only a real leaf gets prefix-matched by findNavItemForPath —
    // which is what lets this one entry govern /my-children/<id> too, the same
    // way /students covers /students/<id>.
    parentItem({
      label: "My Children",
      href: "/my-children",
      icon: Users2,
      description: "Each child's results and fees for the term.",
    }, false),
  ],
};
