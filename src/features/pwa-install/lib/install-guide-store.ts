import { create } from "zustand";

// Whether the step-by-step guide is open. A store rather than local state
// because two places open it (the banner and the account menu), and the menu
// closes itself on click, unmounting anything rendered inside it.
interface InstallGuideState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useInstallGuide = create<InstallGuideState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
