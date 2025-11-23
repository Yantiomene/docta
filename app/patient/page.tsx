export default function PatientPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Docta Patient Dashboard</h1>
      <p className="text-gray-600">View appointments, messages, and notifications.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Appointments</h3>
          <p className="text-sm text-gray-600">Upcoming and past visits.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Messages</h3>
          <p className="text-sm text-gray-600">Conversations with your care team.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-sm text-gray-600">Important updates and reminders.</p>
        </div>
      </div>
    </div>
  );
}

