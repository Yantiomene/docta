import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col sm:flex-row w-full">
      <aside className="w-full sm:w-64 sm:border-r border-b sm:border-b-0 p-4 space-y-3">
        <h2 className="text-lg font-semibold">Admin</h2>
        <nav className="space-y-2">
          <Link href="/admin" className="block hover:underline">Dashboard</Link>
          <Link href="/admin/users" className="block hover:underline">Users</Link>
          <Link href="/admin/patients" className="block hover:underline">Patients</Link>
          <Link href="/admin/hospitalizations" className="block hover:underline">Hospitalizations</Link>
          <Link href="/admin/soins" className="block hover:underline">Soins</Link>
          <Link href="/admin/appointments" className="block hover:underline">Appointments</Link>
          <Link href="/admin/messages" className="block hover:underline">Messages</Link>
          <Link href="/admin/notifications" className="block hover:underline">Notifications</Link>
          <Link href="/admin/planning" className="block hover:underline">Planning</Link>
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-6 w-full">{children}</main>
    </div>
  );
}
