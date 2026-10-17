// "Saturday" or "Sunday" for a register date (YYYY-MM-DD), otherwise null.
//
// Parsed as a LOCAL date: new Date("2026-10-11") alone is read as UTC
// midnight, which some timezones turn into the previous day.
export function weekendDayName(date: string): "Saturday" | "Sunday" | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const day = new Date(`${date}T00:00:00`).getDay();
  if (day === 6) return "Saturday";
  if (day === 0) return "Sunday";
  return null;
}
