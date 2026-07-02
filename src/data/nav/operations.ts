import {
  Wrench,
  Library,
  Bus,
  BedDouble,
  Package,
  HeartPulse,
  UtensilsCrossed,
  DoorOpen,
  Baby,
} from "lucide-react";

import { adminItem, type NavGroup } from "./types";

export const operationsGroup: NavGroup = {
  label: "Operations",
  icon: Wrench,
  items: [
    adminItem({
      label: "Library",
      href: "/library",
      icon: Library,
      description: "Catalog books, track borrowing, and manage library fines.",
    }),
    adminItem({
      label: "Transport",
      href: "/transport",
      icon: Bus,
      description: "Manage school bus routes, stops, and student transport assignments.",
    }),
    adminItem({
      label: "Hostel & Boarding",
      href: "/hostel",
      icon: BedDouble,
      description: "Assign boarding students to hostels, rooms, and beds.",
    }),
    adminItem({
      label: "Inventory & Assets",
      href: "/inventory",
      icon: Package,
      description: "Track school assets, equipment, and consumable stock levels.",
    }),
    adminItem({
      label: "Health / Clinic",
      href: "/health",
      icon: HeartPulse,
      description: "Keep student health records and log clinic visits and incidents.",
    }),
    adminItem({
      label: "Cafeteria & Meals",
      href: "/cafeteria",
      icon: UtensilsCrossed,
      description: "Plan meal schedules and manage cafeteria accounts and orders.",
    }),
    adminItem({
      label: "Visitors & Gate",
      href: "/visitors",
      icon: DoorOpen,
      description: "Log visitor check-ins and manage gate security records.",
    }),
    adminItem({
      label: "Daycare Care Logs",
      href: "/care-logs",
      icon: Baby,
      description: "Record feeding, naps, and daily care notes for daycare children.",
    }),
  ],
};
