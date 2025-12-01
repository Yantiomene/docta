"use client";

import { useRef, useState } from "react";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import { updateUserRoleAction } from "@/lib/actions/adminUsers";

type Props = {
  userId: string;
  currentRole: "admin" | "medecin" | "infirmiere" | "patient";
};

export default function ConfirmRoleChange({ userId, currentRole }: Props) {
  const [role, setRole] = useState<string>(currentRole);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="relative">
      <form ref={formRef} action={updateUserRoleAction} className="flex items-center gap-2">
        <input type="hidden" name="user_id" value={userId} />
        <input type="hidden" name="role" value={role} />
        <Select defaultValue={currentRole} onChange={(e) => setRole(e.target.value)} className="w-40">
          <option value="patient">Patient</option>
          <option value="medecin">Médecin</option>
          <option value="infirmiere">Infirmière</option>
          <option value="admin">Admin</option>
        </Select>
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>Save</Button>
      </form>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 space-y-3">
            <h3 className="font-semibold">Confirm role change</h3>
            <p className="text-sm text-gray-700">Change role from <strong>{currentRole}</strong> to <strong>{role}</strong>?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => { setOpen(false); formRef.current?.requestSubmit(); }}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

