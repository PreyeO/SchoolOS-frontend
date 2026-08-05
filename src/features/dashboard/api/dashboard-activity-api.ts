// MOCK — replace with real API calls when the backend endpoints are ready.
// (Recent activity is no longer mocked — see features/audit-logs/.)

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
}

export interface Notification {
  id: string;
  text: string;
  timestamp: string;
  unread: boolean;
}

function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  await delay(300);
  return [
    { id: "1", title: "Mid-term break begins", date: "Fri, 18 Jul" },
    { id: "2", title: "PTA meeting", date: "Wed, 23 Jul" },
    { id: "3", title: "Inter-house sports day", date: "Sat, 2 Aug" },
  ];
}

export async function getNotifications(): Promise<Notification[]> {
  await delay(300);
  return [
    { id: "1", text: "5 students have overdue fee balances", timestamp: "2 hours ago", unread: true },
    { id: "2", text: "Second Term results are ready to publish", timestamp: "1 day ago", unread: true },
    { id: "3", text: "Your free trial ends in 24 days", timestamp: "2 days ago", unread: false },
  ];
}
