"use client";
import Link from "next/link";
import Button from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar:patient:collapsed");
      if (stored) setCollapsed(stored === "1");
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("sidebar:patient:collapsed", collapsed ? "1" : "0"); } catch {}
  }, [collapsed]);

  const asideWidth = collapsed ? "sm:w-16" : "sm:w-64";
  const labelCls = collapsed ? "sr-only" : "";

  return (
    <div className="min-h-screen flex">
      <aside className={`w-64 ${asideWidth} border-r p-4 space-y-3 transition-[width] duration-200`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${labelCls}`}>Patient</h2>
          <Button type="button" variant="outline" className="px-2 py-1" onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? ">" : "<"}
          </Button>
        </div>
        <nav className="space-y-2">
          <Link href="/patient" className="block hover:underline" title="Dashboard" aria-label="Dashboard"><span className={labelCls}>Dashboard</span></Link>
          <Link href="/patient/dossier" className="block hover:underline" title="Mon dossier" aria-label="Mon dossier"><span className={labelCls}>Mon dossier</span></Link>
          <Link href="/patient/appointments" className="block hover:underline" title="Appointments" aria-label="Appointments"><span className={labelCls}>Appointments</span></Link>
          <Link href="/patient/messages" className="block hover:underline" title="Messages" aria-label="Messages"><span className={labelCls}>Messages</span></Link>
          <Link href="/patient/notifications" className="block hover:underline" title="Notifications" aria-label="Notifications"><span className={labelCls}>Notifications</span></Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
