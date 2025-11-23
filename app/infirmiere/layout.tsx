import Link from "next/link";

export default function InfirmiereLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4 space-y-3">
        <h2 className="text-lg font-semibold">Infirmière</h2>
        <nav className="space-y-2">
          <Link href="/infirmiere" className="block hover:underline">Dashboard</Link>
          <Link href="/infirmiere/soins" className="block hover:underline">Soins</Link>
          <Link href="/infirmiere/patients" className="block hover:underline">Patients</Link>
          <Link href="/infirmiere/notifications" className="block hover:underline">Notifications</Link>
          <Link href="/infirmiere/planning" className="block hover:underline">Planning</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
