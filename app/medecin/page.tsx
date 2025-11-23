export default function MedecinPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Docta Médecin Dashboard</h1>
      <p className="text-gray-600">View patients, appointments, and collaborate via messaging.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Patients</h3>
          <p className="text-sm text-gray-600">Explore medical records and history.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Appointments</h3>
          <p className="text-sm text-gray-600">Manage your schedule.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Messages</h3>
          <p className="text-sm text-gray-600">Communicate with patients and staff.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-sm text-gray-600">Stay on top of updates.</p>
        </div>
      </div>
    </div>
  );
}

