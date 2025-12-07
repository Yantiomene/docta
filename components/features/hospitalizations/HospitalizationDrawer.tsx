"use client";
import { useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { updateHospitalizationAction, deleteHospitalizationAction } from "@/lib/actions/hospitalizations";
import DeleteConfirm from "@/components/features/patients/DeleteConfirm";

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
  isAdmin?: boolean;
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

export default function HospitalizationDrawer({ hospitalization, isAdmin = false }: HospitalizationProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"active" | "discharged" | "planned">(hospitalization.status);
  const deleteFormId = `delete-hosp-${hospitalization.id}`;

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
                  <Input
                    type="datetime-local"
                    name="dischargedAt"
                    defaultValue={toLocalInput(hospitalization.discharged_at)}
                    required={status === "discharged"}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-foreground">Statut</label>
                <Select name="status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="active">Actif</option>
                  <option value="discharged">Sortie</option>
                </Select>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="submit">Mettre à jour</Button>
              </div>
            </form>
            {isAdmin && (
              <>
                <form id={deleteFormId} action={deleteHospitalizationAction} className="hidden">
                  <input type="hidden" name="hospitalization_id" value={hospitalization.id} />
                </form>
                <div className="mt-2 flex items-center justify-end">
                  <DeleteConfirm
                    formId={deleteFormId}
                    className="bg-red-600 hover:bg-red-700"
                    title="Confirmer la suppression"
                    message="Cette action supprimera définitivement l’hospitalisation. Êtes-vous sûr de vouloir continuer ?"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
