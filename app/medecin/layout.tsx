import Link from "next/link";

export default function MedecinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4 space-y-3">
        <h2 className="text-lg font-semibold">Médecin</h2>
        <nav className="space-y-2">
          <Link href="/medecin" className="block hover:underline">Dashboard</Link>
          <Link href="/medecin/patients" className="block hover:underline">Patients</Link>
          <Link href="/medecin/appointments" className="block hover:underline">Appointments</Link>
          <Link href="/medecin/messages" className="block hover:underline">Messages</Link>
          <Link href="/medecin/notifications" className="block hover:underline">Notifications</Link>
          <Link href="/medecin/planning" className="block hover:underline">Planning</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
