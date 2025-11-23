export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Docta Admin Dashboard</h1>
      <p className="text-gray-600">Manage patients, hospitalizations, soins, appointments, messages, notifications, and planning.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Patients</h3>
          <p className="text-sm text-gray-600">Create and manage patient medical records.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Hospitalizations</h3>
          <p className="text-sm text-gray-600">Track patient admissions and discharges.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Soins</h3>
          <p className="text-sm text-gray-600">Schedule treatments and nurse notifications.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Appointments</h3>
          <p className="text-sm text-gray-600">Book and manage appointments.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Messages</h3>
          <p className="text-sm text-gray-600">Internal messaging between users.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-sm text-gray-600">Real-time alerts (in-app, email, push).</p>
        </div>
        <div className="rounded-lg border p-4 md:col-span-2">
          <h3 className="font-semibold">Planning</h3>
          <p className="text-sm text-gray-600">Team shift planning and scheduling.</p>
        </div>
      </div>
    </div>
  );
}

