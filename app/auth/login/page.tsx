"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const roles = ["admin", "medecin", "infirmiere", "patient"] as const;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<typeof roles[number]>("patient");

  function simulateLogin(e: React.FormEvent) {
    e.preventDefault();
    document.cookie = `role=${role}; path=/`;
    router.push(`/${role}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Docta Login</h1>
        <p className="text-sm text-gray-600">Placeholder login (Supabase auth to be wired)</p>
        <form onSubmit={simulateLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof roles[number])}
              className="w-full rounded-md border px-3 py-2"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full rounded-md bg-black text-white px-3 py-2">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

