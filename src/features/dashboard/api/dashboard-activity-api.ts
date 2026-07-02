// MOCK — replace with real API calls when the backend endpoints are ready.

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
}

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

export async function getRecentActivity(): Promise<ActivityItem[]> {
  await delay();
  return [
    { id: "1", text: "Chidinma A. recorded ₦45,000 fee payment for Amara O.", timestamp: "10 minutes ago" },
    { id: "2", text: "New admission application submitted for Primary 3", timestamp: "1 hour ago" },
    { id: "3", text: "Mr. Okafor posted an announcement: \"Mid-term break dates\"", timestamp: "3 hours ago" },
    { id: "4", text: "Attendance completed for JSS 2 — 32/34 present", timestamp: "Yesterday" },
    { id: "5", text: "Second Term results published for SSS 3", timestamp: "2 days ago" },
  ];
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
