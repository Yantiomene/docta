import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import { updateSoinStatusAction, deleteSoinAction } from "@/lib/actions/soins";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";
import DeleteConfirm from "@/components/features/patients/DeleteConfirm";
import { formatDate } from "@/lib/utils";

type Scope = "infirmiere" | "admin";

export default async function SoinList({ scope = "infirmiere" }: { scope?: Scope }) {
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

  let query = supabase
    .from("soins")
    .select("id, title, description, scheduled_at, status, assigned_to_nurse_id, patient_id, patients(first_name, last_name)")
    .order("scheduled_at", { ascending: true });

  if (scope === "infirmiere" && currentUser) {
    query = query.eq("assigned_to_nurse_id", currentUser.id);
  }

  const { data: rows, error } = await query;
  if (error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2">
        Erreur lors du chargement des soins: {error.message}
      </div>
    );
  }

  const soins = rows ?? [];

  return (
    <div className="rounded-lg border mt-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left px-3 py-2">Patient</th>
            <th className="text-left px-3 py-2">Titre</th>
            <th className="text-left px-3 py-2">Planifié</th>
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

