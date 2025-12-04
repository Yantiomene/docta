"use client";

import { useMemo, useState } from "react";
import { staffCreateOrLinkPatientAction } from "@/lib/actions/patients";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";

type UserOption = { id: string; email: string | null; nom: string | null; prenom: string | null; role: string | null };

export default function PatientForm({ users }: { users: UserOption[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const prenom = (u.prenom || "").toLowerCase();
      const nom = (u.nom || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return prenom.includes(q) || nom.includes(q) || email.includes(q);
    });
  }, [users, query]);

  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={staffCreateOrLinkPatientAction} className="space-y-3">
      <div>
        <label className="text-sm">Rechercher un utilisateur (nom/email)</label>
        <Input
          type="text"
          placeholder="Tapez pour filtrer…"
          value={query}
          autoComplete="off"
          onChange={(e: any) => setQuery(e.target.value)}
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        />
        <p className="text-xs text-gray-600 mt-1">{filtered.length} utilisateurs</p>
      </div>
      <div>
        <label className="text-sm">Associer à un utilisateur (optionnel)</label>
        <Select name="user_id" className="w-full">
          <option value="">Sans compte</option>
          {filtered.map((u) => (
            <option key={u.id} value={u.id}>
              {(u.prenom || "") + " " + (u.nom || "")} — {u.email || "(sans email)"} — {u.role || ""}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="text-sm">First name</label>
        <Input name="firstName" required minLength={2} />
      </div>
      <div>
        <label className="text-sm">Last name</label>
        <Input name="lastName" required minLength={2} />
      </div>
      <div>
        <label className="text-sm">Email (optional)</label>
        <Input type="email" name="email" inputMode="email" />
      </div>
      <div>
        <label className="text-sm">Phone (optional)</label>
        <Input name="phone" pattern="^\\+?[0-9]{7,15}$" title="Format: +XXXXXXXXXXX (7–15 chiffres)" />
      </div>
      <div>
        <label className="text-sm">Date of birth (optional)</label>
        <Input type="date" name="dob" max={today} />
      </div>
      <div>
        <label className="text-sm">Gender</label>
        <Select name="gender" required className="w-full">
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <div>
        <label className="text-sm">Blood Type (optional)</label>
        <Select name="bloodType" className="w-full">
          <option value="">Select</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </Select>
      </div>
      <Button type="submit">Save Patient</Button>
    </form>
  );
}
