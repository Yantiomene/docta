import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";
import Button from "@/components/ui/button";
import { dischargeHospitalizationAction, deleteHospitalizationAction } from "@/lib/actions/hospitalizations";
import HospitalizationDrawer from "./HospitalizationDrawer";

export default async function HospitalizationList() {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  let isAdmin = false;
  if (user) {
    const service = getServiceSupabase();
    const { data: me } = await service
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = String(me?.role || "").toLowerCase() === "admin";
  }
  const service = getServiceSupabase();
  const { data, error } = await service
    .from("hospitalisations")
    .select("id, dossier_patient_id, patient_id, service, chambre, lit, date_admission, date_sortie_reelle, statut")
    .order("date_admission", { ascending: false });

  if (error) {
    return (
      <div className="text-sm text-destructive">{error.message}</div>
    );
  }

  const rows = (data ?? []) as any[];

  const dossierIds = Array.from(new Set(rows.map((h: any) => h.dossier_patient_id).filter(Boolean)));
  const patientIds = Array.from(new Set(rows.map((h: any) => h.patient_id).filter(Boolean)));
  let dossierToProfileId: Record<string, string> = {};
  let profileMap: Record<string, { nom?: string | null; prenom?: string | null }> = {};
  let patientMap: Record<string, { first_name?: string | null; last_name?: string | null }> = {};
  if (dossierIds.length > 0) {
    const service = getServiceSupabase();
    const { data: dossiers } = await service
      .from("dossiers_patients")
      .select("id, patient_id")
      .in("id", dossierIds);
    (dossiers || []).forEach((d: any) => {
      if (d.id && d.patient_id) dossierToProfileId[d.id] = d.patient_id;
    });
    const profileIds = Array.from(new Set(Object.values(dossierToProfileId)));
    if (profileIds.length > 0) {
      const { data: profiles } = await service
        .from("profiles")
        .select("id, nom, prenom")
        .in("id", profileIds);
      (profiles || []).forEach((p: any) => {
        profileMap[p.id] = { nom: p.nom ?? null, prenom: p.prenom ?? null };
      });
    }
  }
  if (patientIds.length > 0) {
    const service = getServiceSupabase();
    const { data: patients } = await service
      .from("patients")
      .select("id, first_name, last_name")
      .in("id", patientIds);
    (patients || []).forEach((p: any) => {
      patientMap[p.id] = { first_name: p.first_name ?? null, last_name: p.last_name ?? null };
    });
  }

  if (!rows.length) {
    return <div className="text-sm text-muted-foreground">Aucune hospitalisation</div>;
  }

  return (
    <div className="border border-muted rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted text-foreground">
          <tr>
            <th className="text-left px-3 py-2">Patient</th>
            <th className="text-left px-3 py-2">Service</th>
            <th className="text-left px-3 py-2">Chambre</th>
            <th className="text-left px-3 py-2">Lit</th>
            <th className="text-left px-3 py-2">Date d’admission</th>
            <th className="text-left px-3 py-2">Date de sortie</th>
            <th className="text-left px-3 py-2">Statut</th>
            <th className="text-right px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => {
            const dossiersPatientId = (h as any).dossier_patient_id as string | undefined;
            const profId = dossiersPatientId ? dossierToProfileId[dossiersPatientId] : undefined;
            const prof = profId ? profileMap[profId] : undefined;
            const pid = (h as any).patient_id as string | undefined;
            const pat = pid ? patientMap[pid] : undefined;
            const name = pat
              ? `${pat.last_name ?? ""} ${pat.first_name ?? ""}`.trim()
              : prof
              ? `${prof.nom ?? ""} ${prof.prenom ?? ""}`.trim()
              : "";
            const statutFr = String((h as any).statut || "");
            const status = statutFr === "en_cours" ? "active" : statutFr === "sortie" ? "discharged" : "planned";
            return (
              <tr key={h.id} className="border-t border-muted">
                <td className="px-3 py-2">
                  <HospitalizationDrawer
                    hospitalization={{
                      id: h.id,
                      ward: h.service ?? null,
                      room: h.chambre ?? null,
                      bed: h.lit ?? null,
                      admitted_at: h.date_admission,
                      discharged_at: h.date_sortie_reelle ?? null,
                      status: status as any,
                      patient_name: name || String(h.dossier_patient_id),
                    }}
                    isAdmin={isAdmin}
                  />
                </td>
                <td className="px-3 py-2">{h.service || "-"}</td>
                <td className="px-3 py-2">{h.chambre || "-"}</td>
                <td className="px-3 py-2">{h.lit || "-"}</td>
                <td className="px-3 py-2">{new Date(h.date_admission).toLocaleString()}</td>
                <td className="px-3 py-2">{h.date_sortie_reelle ? new Date(h.date_sortie_reelle).toLocaleString() : "-"}</td>
                <td className="px-3 py-2">{status}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    {status !== "discharged" && (
                      <form action={dischargeHospitalizationAction}>
                        <input type="hidden" name="hospitalization_id" value={h.id} />
                        <Button type="submit" className="px-2 py-1">Sortir</Button>
                      </form>
                    )}
                    {isAdmin && (
                      <form action={deleteHospitalizationAction}>
                        <input type="hidden" name="hospitalization_id" value={h.id} />
                        <Button type="submit" variant="outline" className="px-2 py-1">Supprimer</Button>
                      </form>
                    )}
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
