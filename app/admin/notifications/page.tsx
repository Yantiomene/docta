import NotificationList from "@/components/features/notifications/NotificationList";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Notifications</h1>
      <NotificationList />
    </div>
  );
}

