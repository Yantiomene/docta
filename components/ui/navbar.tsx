"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-background border-b border-black/10 dark:border-white/15">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-foreground">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight">Docta</Link>
          <span className="text-sm text-foreground/60">Healthcare Dashboard</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/auth/login" className="hover:underline">Login</Link>
          <Link href="/admin" className="hover:underline">Admin</Link>
          <Link href="/medecin" className="hover:underline">Médecin</Link>
          <Link href="/infirmiere" className="hover:underline">Infirmière</Link>
          <Link href="/patient" className="hover:underline">Patient</Link>
        </div>
      </nav>
    </header>
  );
}

