// Zustand store for global UI state (sidebar open/close, modals, theme).
// TODO (Phase 2): implement store.
import { create } from "zustand";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UIState {}

export const useUIStore = create<UIState>()(() => ({}));
