import { getServerSupabase } from "@/lib/supabaseServer";
import Button from "@/components/ui/button";
import { dischargeHospitalizationAction, deleteHospitalizationAction } from "@/lib/actions/hospitalizations";

export default async function HospitalizationList() {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("hospitalizations")
    .select(
      "id, patient_id, ward, room, bed, admitted_at, discharged_at, status, patients:patient_id (first_name, last_name)"
    )
    .order("admitted_at", { ascending: false });

  if (error) {
    return (
      <div className="text-sm text-destructive">{error.message}</div>
    );
  }

  const rows = data ?? [];

  if (!rows.length) {
    return <div className="text-sm text-muted-foreground">Aucune hospitalisation</div>;
  }

  return (
    <div className="border border-muted rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted text-foreground">
          <tr>
            <th className="text-left px-3 py-2">Patient</th>
            <th className="text-left px-3 py-2">Ward</th>
            <th className="text-left px-3 py-2">Chambre</th>
            <th className="text-left px-3 py-2">Lit</th>
            <th className="text-left px-3 py-2">Admis</th>
            <th className="text-left px-3 py-2">Sorti</th>
            <th className="text-left px-3 py-2">Statut</th>
            <th className="text-right px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => {
            const patient = (h as any).patients as { first_name?: string; last_name?: string } | null;
            const name = patient ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim() : h.patient_id;
            return (
              <tr key={h.id} className="border-t border-muted">
                <td className="px-3 py-2">{name || h.patient_id}</td>
                <td className="px-3 py-2">{h.ward || "-"}</td>
                <td className="px-3 py-2">{h.room || "-"}</td>
                <td className="px-3 py-2">{h.bed || "-"}</td>
                <td className="px-3 py-2">{new Date(h.admitted_at).toLocaleString()}</td>
                <td className="px-3 py-2">{h.discharged_at ? new Date(h.discharged_at).toLocaleString() : "-"}</td>
                <td className="px-3 py-2">{h.status}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    {h.status !== "discharged" && (
                      <form action={dischargeHospitalizationAction}>
                        <input type="hidden" name="hospitalization_id" value={h.id} />
                        <Button type="submit" className="px-2 py-1">Sortir</Button>
                      </form>
                    )}
                    <form action={deleteHospitalizationAction}>
                      <input type="hidden" name="hospitalization_id" value={h.id} />
                      <Button type="submit" variant="outline" className="px-2 py-1">Supprimer</Button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

