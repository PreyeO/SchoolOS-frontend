// App-wide constants: roles, route paths, config keys.
// Single source of truth — import from here, never hardcode in components.
// TODO (Phase 2): populate with real values.

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "SchoolOS";

export const ROLES = {
  ADMIN: "admin",
  BURSAR: "bursar",
  TEACHER: "teacher",
  PARENT: "parent",
  STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: {
    ADMIN: "/admin",
    BURSAR: "/bursar",
    TEACHER: "/teacher",
    PARENT: "/parent",
    STUDENT: "/student",
  },
} as const;
