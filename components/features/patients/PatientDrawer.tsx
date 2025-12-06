import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { updatePatientAction, deletePatientAction } from "@/lib/actions/patients";

export default async function PatientDrawer({ patientId, searchParams }: { patientId: string; searchParams?: Record<string, string | undefined> }) {
  const supabase = getServerSupabase();

  // Guard: staff only
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return null;

  const service = getServiceSupabase();
  const { data: me } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = me?.role ? String(me.role).toLowerCase() : "patient";
  const STAFF_ROLES = new Set(["admin", "medecin", "infirmiere"]);
  if (!STAFF_ROLES.has(role)) return null;

  // Fetch patient via service client to bypass any RLS edge cases
  const { data: patient, error } = await getServiceSupabase()
    .from("patients")
    .select("id, first_name, last_name, email, phone, dob, gender, blood_type, managed_by_staff, created_at, updated_at")
    .eq("id", patientId)
    .maybeSingle();

  const success = searchParams?.success;
  const errMsg = searchParams?.error || error?.message;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl border-l">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Dossier Patient</h2>
          <a href="/admin/patients" className="text-sm text-gray-600 hover:underline">Fermer</a>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          {errMsg ? (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{errMsg}</div>
          ) : null}
          {success ? (
            <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">{success}</div>
          ) : null}

          {!patient ? (
            <p className="text-sm text-gray-600">Patient introuvable.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Créé</p>
                  <p className="text-sm">{new Date(patient.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mis à jour</p>
                  <p className="text-sm">{patient.updated_at ? new Date(patient.updated_at).toLocaleString() : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Géré par staff</p>
                  <p className="text-sm">{patient.managed_by_staff ? "oui" : "non"}</p>
                </div>
              </div>

              <form action={updatePatientAction} className="space-y-3">
                <input type="hidden" name="patient_id" value={patient.id} />
                <div>
                  <label className="text-sm">Nom</label>
                  <Input name="lastName" defaultValue={patient.last_name ?? ""} required minLength={2} />
                </div>
                <div>
                  <label className="text-sm">Prénom</label>
                  <Input name="firstName" defaultValue={patient.first_name ?? ""} required minLength={2} />
                </div>
                <div>
                  <label className="text-sm">Email</label>
                  <Input name="email" type="email" defaultValue={patient.email ?? ""} />
                </div>
                <div>
                  <label className="text-sm">Téléphone</label>
                  <Input name="phone" defaultValue={patient.phone ?? ""} />
                </div>
                <div>
                  <label className="text-sm">Date de naissance</label>
                  <Input name="dob" type="date" defaultValue={patient.dob ?? ""} />
                </div>
                <div>
                  <label className="text-sm">Genre</label>
                  <Select name="gender" defaultValue={patient.gender ?? ""} className="w-full">
                    <option value="">—</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm">Groupe sanguin</label>
                  <Select name="bloodType" defaultValue={patient.blood_type ?? ""} className="w-full">
                    <option value="">—</option>
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
                <div className="flex gap-2">
                  <Button type="submit">Mettre à jour</Button>
                </div>
              </form>
              {role === "admin" ? (
                <form action={deletePatientAction}>
                  <input type="hidden" name="patient_id" value={patient.id} />
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">Supprimer</Button>
                </form>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
