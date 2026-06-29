// Zustand store for authentication state (current user, token, school context).
// TODO (Phase 2): implement store with persist middleware.
import { create } from "zustand";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AuthState {}

export const useAuthStore = create<AuthState>()(() => ({}));
