"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "yan2016tiomene@gmail.com";

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const supabase = getSupabaseClient();

  const name = (user?.user_metadata?.name as string | undefined) || undefined;
  const avatarUrl = (user?.user_metadata?.avatar_url as string | undefined) || undefined;
  const email = user?.email || "";
  const initial = (name || email || "?").charAt(0).toUpperCase();
  const isAdmin = !!user && (user.user_metadata?.role === "admin" || email === ADMIN_EMAIL);

  async function onLogout() {
    await supabase.auth.signOut();
    setOpen(false);
    // Refresh to clear any user-specific UI
    window.location.href = "/";
  }

  return (
    <header className="bg-primary">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-14 flex items-center justify-between text-white flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight">Docta</Link>
          <span className="hidden sm:inline text-sm text-white/80">Healthcare Dashboard</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-sm">
          <Link href="/" className="hover:text-white/80">Home</Link>
          {!user ? (
            <Link href="/auth/login" className="hover:text-white/80">Login</Link>
          ) : (
            <div className="relative">
              <button
                className="size-8 rounded-full bg-secondary text-white flex items-center justify-center overflow-hidden"
                onClick={() => setOpen((v) => !v)}
                aria-label="User menu"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold">{initial}</span>
                )}
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-44 rounded-md border border-muted bg-white shadow text-slate">
                  <div className="px-3 py-2 text-xs text-slate/80">{name || email}</div>
                  <Link href="/settings" className="block px-3 py-2 hover:bg-muted">Preferences</Link>
                  {isAdmin && (
                    <Link href="/admin/users" className="block px-3 py-2 hover:bg-muted">User Administration</Link>
                  )}
                  <button onClick={onLogout} className="w-full text-left px-3 py-2 hover:bg-muted">Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
