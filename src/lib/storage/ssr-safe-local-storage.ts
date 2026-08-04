// A plain Storage-shaped wrapper around localStorage that no-ops during SSR
// (Zustand's persist middleware needs a Storage instance immediately, but
// `localStorage` doesn't exist on the server). Shared by auth-store and
// school-store — localStorage rather than sessionStorage, so a session
// survives opening a dashboard link in a new tab instead of demanding a
// fresh login (sessionStorage is scoped per tab, not per origin).
export const ssrSafeLocalStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window !== "undefined") localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window !== "undefined") localStorage.removeItem(name);
  },
} as Storage;
