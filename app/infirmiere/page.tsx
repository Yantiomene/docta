export default function InfirmierePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Docta Infirmière Dashboard</h1>
      <p className="text-gray-600">Track soins, patient care, and shift planning.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Soins</h3>
          <p className="text-sm text-gray-600">Care/treatment scheduling and reminders.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Patients</h3>
          <p className="text-sm text-gray-600">Patient assignments and status.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-sm text-gray-600">Treatment timers and alerts.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Planning</h3>
          <p className="text-sm text-gray-600">Team shifts and scheduling.</p>
        </div>
      </div>
    </div>
  );
}

