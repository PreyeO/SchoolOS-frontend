export const env = {
  get API_BASE_URL(): string {
    const v = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!v) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set. Add it to .env.local.");
    return v;
  },
  get SCHOOL_DOMAIN(): string {
    return process.env.NEXT_PUBLIC_SCHOOL_DOMAIN ?? "schoolos.com";
  },
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "SchoolOS",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
} as const;
