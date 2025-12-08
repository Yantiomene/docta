"use client";
import Link from "next/link";
import Button from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function InfirmiereLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar:infirmiere:collapsed");
      if (stored) setCollapsed(stored === "1");
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("sidebar:infirmiere:collapsed", collapsed ? "1" : "0"); } catch {}
  }, [collapsed]);

  const asideWidth = collapsed ? "w-16" : "w-56"; // largeur réduite, repli mobile inclus
  const labelCls = collapsed ? "sr-only" : "";

  return (
    <div className="min-h-screen flex">
      <aside className={`${asideWidth} border-r p-4 space-y-3 transition-[width] duration-200`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${labelCls}`}>Infirmière</h2>
          <Button type="button" variant="outline" className="px-2 py-1" onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? ">" : "<"}
          </Button>
        </div>
        <nav className="space-y-2">
          <Link href="/infirmiere" className="block hover:underline" title="Dashboard" aria-label="Dashboard"><span className={labelCls}>Dashboard</span></Link>
          <Link href="/infirmiere/soins" className="block hover:underline" title="Soins" aria-label="Soins"><span className={labelCls}>Soins</span></Link>
          <Link href="/infirmiere/patients" className="block hover:underline" title="Patients" aria-label="Patients"><span className={labelCls}>Patients</span></Link>
          <Link href="/infirmiere/hospitalizations" className="block hover:underline" title="Hospitalisations" aria-label="Hospitalisations"><span className={labelCls}>Hospitalisations</span></Link>
          <Link href="/infirmiere/notifications" className="block hover:underline" title="Notifications" aria-label="Notifications"><span className={labelCls}>Notifications</span></Link>
          <Link href="/infirmiere/planning" className="block hover:underline" title="Planning" aria-label="Planning"><span className={labelCls}>Planning</span></Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
