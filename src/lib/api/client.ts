import axios from "axios";

import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth-store";

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Public endpoints must never receive an Authorization header. A stale token in
// the store would otherwise be attached to signup/login and reject with 401.
const PUBLIC_PATHS = [
  "/api/users/", // signup
  "/api/auth/verify-email/",
  "/api/auth/resend-verification/",
  "/api/auth/login/", // reserved for when login is wired up
];

function isPublicPath(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_PATHS.some((path) => url.includes(path));
}

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.access;
  if (token && !isPublicPath(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
