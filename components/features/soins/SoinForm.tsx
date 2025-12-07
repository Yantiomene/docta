import PatientAutocomplete from "@/components/features/patients/PatientAutocomplete";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import { createSoinAction } from "@/lib/actions/soins";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";

export default async function SoinForm() {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const currentUser = auth?.user || null;
  let role: string | undefined = undefined;
  if (currentUser) {
    const service = getServiceSupabase();
    const { data: me } = await service
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .maybeSingle();
    role = me?.role ? String(me.role).toLowerCase() : undefined;
  }

  const todayIso = new Date().toISOString().slice(0, 16);

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h2 className="text-lg font-medium">Créer un soin</h2>
      <form action={createSoinAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <PatientAutocomplete name="patientId" label="Patient" />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm text-foreground">Titre</label>
          <Input name="title" required minLength={2} placeholder="Ex: Pansement, injection, contrôle" />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm text-foreground">Description (optionnel)</label>
          <Textarea name="description" rows={3} placeholder="Détails du soin" />
        </div>

        <div>
          <label className="text-sm text-foreground">Planifié le</label>
          <Input type="datetime-local" name="scheduledAt" required defaultValue={todayIso} />
        </div>

        <div>
          <label className="text-sm text-foreground">Statut</label>
          <Select name="status" defaultValue="scheduled" className="w-full">
            <option value="scheduled">Planifié</option>
            <option value="in_progress">En cours</option>
            <option value="done">Terminé</option>
            <option value="missed">Manqué</option>
          </Select>
        </div>

        {role === "infirmiere" && currentUser ? (
          <input type="hidden" name="assignedToNurseId" value={currentUser.id} />
        ) : (
          <div className="sm:col-span-2">
            <label className="text-sm text-foreground">Infirmière (ID utilisateur — optionnel)</label>
            <Input name="assignedToNurseId" placeholder="uuid de l’infirmière (optionnel)" />
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end gap-3">
          <Button type="submit">Créer</Button>
        </div>
      </form>
    </div>
  );
}

