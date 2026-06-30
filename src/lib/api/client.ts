import axios from "axios";

import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth-store";

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
