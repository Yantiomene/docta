"use client";
import { useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { updateHospitalizationAction } from "@/lib/actions/hospitalizations";

type HospitalizationProps = {
  hospitalization: {
    id: string;
    ward: string | null;
    room: string | null;
    bed: string | null;
    admitted_at: string;
    discharged_at: string | null;
    status: "active" | "discharged" | "planned";
    patient_name: string;
  };
};

function toLocalInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function HospitalizationDrawer({ hospitalization }: HospitalizationProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="text-primary hover:underline"
        onClick={() => setOpen(true)}
      >
        {hospitalization.patient_name}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl border-l border-muted p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Modifier l’hospitalisation</h3>
              <Button type="button" variant="outline" className="px-2 py-1" onClick={() => setOpen(false)}>
                Fermer
              </Button>
            </div>

            <form action={updateHospitalizationAction} className="space-y-3">
              <input type="hidden" name="hospitalization_id" value={hospitalization.id} />

              <div>
                <label className="text-sm text-foreground">Service</label>
                <Input name="ward" defaultValue={hospitalization.ward ?? ""} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-foreground">Chambre</label>
                  <Input name="room" defaultValue={hospitalization.room ?? ""} />
                </div>
                <div>
                  <label className="text-sm text-foreground">Lit</label>
                  <Input name="bed" defaultValue={hospitalization.bed ?? ""} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-foreground">Date d’admission</label>
                  <Input type="datetime-local" name="admittedAt" defaultValue={toLocalInput(hospitalization.admitted_at)} />
                </div>
                <div>
                  <label className="text-sm text-foreground">Date de sortie</label>
                  <Input type="datetime-local" name="dischargedAt" defaultValue={toLocalInput(hospitalization.discharged_at)} />
                </div>
              </div>
              <div>
                <label className="text-sm text-foreground">Statut</label>
                <Input name="status" defaultValue={hospitalization.status} />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="submit">Mettre à jour</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

