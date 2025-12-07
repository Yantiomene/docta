"use client";
import Link from "next/link";
import Button from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar:admin:collapsed");
      if (stored) setCollapsed(stored === "1");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("sidebar:admin:collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  const asideWidth = collapsed ? "w-16" : "w-56"; // réduit par défaut, replié aussi sur mobile
  const labelCls = collapsed ? "sr-only" : "";

  return (
    <div className="min-h-screen flex w-full">
      <aside className={`${asideWidth} border-r p-4 space-y-3 transition-[width] duration-200`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${labelCls}`}>Admin</h2>
          <Button type="button" variant="outline" className="px-2 py-1" onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? ">" : "<"}
          </Button>
        </div>
        <nav className="space-y-2">
          <Link href="/admin" className="block hover:underline" title="Dashboard" aria-label="Dashboard"><span className={labelCls}>Dashboard</span></Link>
          <Link href="/admin/users" className="block hover:underline" title="Users" aria-label="Users"><span className={labelCls}>Users</span></Link>
          <Link href="/admin/patients" className="block hover:underline" title="Patients" aria-label="Patients"><span className={labelCls}>Patients</span></Link>
          <Link href="/admin/hospitalizations" className="block hover:underline" title="Hospitalizations" aria-label="Hospitalizations"><span className={labelCls}>Hospitalizations</span></Link>
          <Link href="/admin/soins" className="block hover:underline" title="Soins" aria-label="Soins"><span className={labelCls}>Soins</span></Link>
          <Link href="/admin/appointments" className="block hover:underline" title="Appointments" aria-label="Appointments"><span className={labelCls}>Appointments</span></Link>
          <Link href="/admin/messages" className="block hover:underline" title="Messages" aria-label="Messages"><span className={labelCls}>Messages</span></Link>
          <Link href="/admin/notifications" className="block hover:underline" title="Notifications" aria-label="Notifications"><span className={labelCls}>Notifications</span></Link>
          <Link href="/admin/planning" className="block hover:underline" title="Planning" aria-label="Planning"><span className={labelCls}>Planning</span></Link>
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-6 w-full">{children}</main>
    </div>
  );
}
