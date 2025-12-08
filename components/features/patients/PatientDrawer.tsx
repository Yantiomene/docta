import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { updatePatientAction, deletePatientAction } from "@/lib/actions/patients";
import DeleteConfirm from "./DeleteConfirm";

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
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-neutral-900 shadow-xl border-l flex flex-col">
        <div className="flex items-center justify-between border-b p-4 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dossier Patient</h2>
          {(() => {
            const q = searchParams?.q;
            const base = role === "admin" ? "/admin/patients" : role === "medecin" ? "/medecin/patients" : role === "infirmiere" ? "/infirmiere/patients" : "/";
            const usp = new URLSearchParams();
            if (q && typeof q === "string" && q.trim() !== "") usp.set("q", q);
            const href = usp.toString() ? `${base}?${usp.toString()}` : base;
            return (
              <a href={href} className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Fermer</a>
            );
          })()}
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto text-gray-900 dark:text-gray-100">
          {errMsg ? (
            <div className="rounded-md border border-red-300 bg-red-50 dark:border-red-500/70 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">{errMsg}</div>
          ) : null}
          {success ? (
            <div className="rounded-md border border-green-300 bg-green-50 dark:border-green-500/70 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-300">{success}</div>
          ) : null}

          {!patient ? (
            <p className="text-sm text-gray-600">Patient introuvable.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Créé</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{new Date(patient.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Mis à jour</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{patient.updated_at ? new Date(patient.updated_at).toLocaleString() : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Géré par staff</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{patient.managed_by_staff ? "oui" : "non"}</p>
                </div>
              </div>

              <form id="updatePatientForm" action={updatePatientAction} className="space-y-3">
                <input type="hidden" name="patient_id" value={patient.id} />
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-200">Nom</label>
                  <Input name="lastName" defaultValue={patient.last_name ?? ""} required minLength={2} />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-200">Prénom</label>
                  <Input name="firstName" defaultValue={patient.first_name ?? ""} required minLength={2} />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-200">Email</label>
                  <Input name="email" type="email" defaultValue={patient.email ?? ""} />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-200">Téléphone</label>
                  <Input name="phone" defaultValue={patient.phone ?? ""} />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-200">Date de naissance</label>
                  <Input name="dob" type="date" defaultValue={patient.dob ?? ""} />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-200">Genre</label>
                  <Select name="gender" defaultValue={patient.gender ?? ""} className="w-full">
                    <option value="">—</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-200">Groupe sanguin</label>
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
              </form>
              <div className="sticky bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur p-3 border-t flex gap-2">
                <Button type="submit" form="updatePatientForm">Mettre à jour</Button>
                {role === "admin" ? (
                  <form id="deletePatientForm" action={deletePatientAction}>
                    <input type="hidden" name="patient_id" value={patient.id} />
                  </form>
                ) : null}
                {role === "admin" ? (
                  <DeleteConfirm formId="deletePatientForm" />
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
