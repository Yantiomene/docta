import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import { updateSoinStatusAction, deleteSoinAction } from "@/lib/actions/soins";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";
import DeleteConfirm from "@/components/features/patients/DeleteConfirm";
import { formatDate } from "@/lib/utils";

type Scope = "infirmiere" | "admin";

function statusBadge(status: string, scheduledAt: string) {
  const now = new Date();
  const sched = new Date(scheduledAt);
  const overdue = status !== "done" && !isNaN(sched.getTime()) && sched < now;
  let label = "";
  let cls = "";
  switch (status) {
    case "scheduled":
      label = overdue ? "Planifié (retard)" : "Planifié";
      cls = overdue ? "bg-red-100 text-red-700 border-red-300" : "bg-blue-100 text-blue-700 border-blue-300";
      break;
    case "in_progress":
      label = "En cours";
      cls = "bg-yellow-100 text-yellow-800 border-yellow-300";
      break;
    case "done":
      label = "Fait";
      cls = "bg-green-100 text-green-700 border-green-300";
      break;
    case "missed":
      label = "Manqué";
      cls = "bg-red-100 text-red-700 border-red-300";
      break;
    default:
      label = status;
      cls = "bg-gray-100 text-gray-700 border-gray-300";
  }
  let extra = "";
  if (overdue) {
    const diffMs = now.getTime() - sched.getTime();
    const diffMin = Math.round(diffMs / 60000);
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    extra = ` (délais dépassé de ${h}h${m}m)`;
  }
  return { label: label + extra, cls };
}

export default async function SoinList({ scope = "infirmiere", filters }: { scope?: Scope; filters?: { start?: string; end?: string; q?: string } }) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user || null;

  const service = getServiceSupabase();
  const { data: me } = await service
    .from("profiles")
    .select("role")
    .eq("id", currentUser?.id || "")
    .maybeSingle();
  const role = me?.role ? String(me.role).toLowerCase() : undefined;
  const isAdmin = role === "admin";

  let query = service
    .from("soins")
    .select("id, title, description, scheduled_at, status, assigned_to_nurse_id, patient_id, patients(first_name, last_name)")
    .order("scheduled_at", { ascending: true });

  if (scope === "infirmiere" && currentUser) {
    query = query.eq("assigned_to_nurse_id", currentUser.id);
  }

  // Apply date range filters
  if (filters?.start) {
    query = query.gte("scheduled_at", filters.start);
  }
  if (filters?.end) {
    // Add one day to include end date fully if provided as YYYY-MM-DD
    query = query.lte("scheduled_at", filters.end + "T23:59:59.999Z");
  }
  // Apply text search on title/description
  if (filters?.q && filters.q.trim() !== "") {
    const like = `%${filters.q.trim()}%`;
    query = query.or(`title.ilike.${like},description.ilike.${like}`);
  }

  const { data: rows, error } = await query;
  if (error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2">
        Erreur lors du chargement des soins: {error.message}
      </div>
    );
  }

  let soins = rows ?? [];
  // Fallback text search against patient name if provided
  if (filters?.q && filters.q.trim() !== "") {
    const q = filters.q.trim().toLowerCase();
    soins = soins.filter((s: any) => {
      const patientName = `${s.patients?.first_name ?? ""} ${s.patients?.last_name ?? ""}`.toLowerCase();
      return (
        (s.title ?? "").toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q) ||
        patientName.includes(q)
      );
    });
  }

  // Fetch hospitalization (ward/bed) for patients present
  const hospIds = Array.from(new Set(soins.map((s: any) => s.hospitalisation_id).filter(Boolean)));
  let hosps: Record<string, { ward?: string | null; bed?: string | null }> = {};
  if (hospIds.length > 0) {
    const { data: hospRows } = await service
      .from("hospitalisations")
      .select("id, service, lit, statut, date_admission, date_sortie_reelle")
      .in("id", hospIds);
    (hospRows || []).forEach((h: any) => {
      const key = h.id as string;
      const prev = hosps[key];
      const isBetter = !prev || String(h.statut) === "en_cours";
      if (isBetter) hosps[key] = { ward: h.service ?? null, bed: h.lit ?? null };
    });
  }

  // Fetch nurse names for assigned_to_nurse_id
  const nurseIds = Array.from(new Set(soins.map((s: any) => s.assigned_to_nurse_id).filter(Boolean))) as string[];
  const nurseMap: Record<string, { nom?: string; prenom?: string }> = {};
  if (nurseIds.length > 0) {
    const { data: nurses } = await getServiceSupabase()
      .from("profiles")
      .select("id, nom, prenom")
      .in("id", nurseIds);
    (nurses || []).forEach((n: any) => {
      nurseMap[n.id] = { nom: n.nom, prenom: n.prenom };
    });
  }

  return (
    <div className="rounded-lg border mt-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left px-3 py-2">Patient</th>
            <th className="text-left px-3 py-2">Titre</th>
            <th className="text-left px-3 py-2">Planifié</th>
            <th className="text-left px-3 py-2">Salle / Lit</th>
            <th className="text-left px-3 py-2">Statut</th>
            <th className="text-right px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {soins.map((s) => {
            const patient = (s as any).patients as { first_name?: string; last_name?: string } | null;
            const name = patient ? `${patient.last_name ?? ""} ${patient.first_name ?? ""}`.trim() : s.patient_id;
            const deleteFormId = `delete-soin-${s.id}`;
            return (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">{name || s.patient_id}</td>
                <td className="px-3 py-2">{s.title}</td>
                <td className="px-3 py-2">{formatDate(s.scheduled_at)}</td>
                <td className="px-3 py-2">
                  {(() => {
                    const h = hosps[(s as any).hospitalisation_id] || { ward: null, bed: null };
                    const ward = h.ward || "-";
                    const bed = h.bed || "-";
                    return (
                      <span className="text-sm text-muted-foreground">{ward} / {bed}</span>
                    );
                  })()}
                </td>
                <td className="px-3 py-2">
                  <form action={updateSoinStatusAction} className="inline-flex items-center gap-2">
                    <input type="hidden" name="soin_id" value={s.id} />
                    <Select name="status" defaultValue={s.status} className="w-36">
                      <option value="scheduled">Planifié</option>
                      <option value="in_progress">En cours</option>
                      <option value="done">Terminé</option>
                      <option value="missed">Manqué</option>
                    </Select>
                    <Button type="submit" className="px-2 py-1">Mettre à jour</Button>
                  </form>
                  {(() => {
                    const { label, cls } = statusBadge(s.status as string, s.scheduled_at as string);
                    const nurse = s.status === "done" && s.assigned_to_nurse_id ? nurseMap[s.assigned_to_nurse_id] : null;
                    return (
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-block rounded border px-2 py-0.5 text-xs ${cls}`}>{label}</span>
                        {nurse && (
                          <span className="text-xs text-muted-foreground">par {nurse.nom ?? ""} {nurse.prenom ?? ""}</span>
                        )}
                      </div>
                    );
                  })()}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    {isAdmin && (
                      <>
                        {/* Hidden delete form referenced by the modal */}
                        <form id={deleteFormId} action={deleteSoinAction}>
                          <input type="hidden" name="soin_id" value={s.id} />
                        </form>
                        <DeleteConfirm
                          title="Supprimer le soin"
                          message={`Êtes-vous sûr de vouloir supprimer ce soin pour ${name || s.patient_id} ? Cette action est irréversible.`}
                          formId={deleteFormId}
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {soins.length === 0 && (
        <p className="px-3 py-2 text-sm text-muted-foreground">Aucun soin trouvé.</p>
      )}
    </div>
  );
}
