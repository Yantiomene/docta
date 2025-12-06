import { getServerSupabase, getServiceSupabase } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function AdminPatientDetailPage({ params }: { params: { id: string } }) {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    redirect("/auth/login");
  }

  // Guard: only staff can access
  const service = getServiceSupabase();
  const { data: me } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = me?.role ? String(me.role).toLowerCase() : "patient";
  const STAFF_ROLES = new Set(["admin", "medecin", "infirmiere"]);
  if (!STAFF_ROLES.has(role)) {
    redirect(`/${role}`);
  }

  // Fetch patient details
  const { data: patient, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name, email, phone, dob, gender, blood_type, user_id, managed_by_staff, created_at, updated_at")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Dossier Patient</h1>
        <p className="text-sm text-red-600">Erreur: {error.message}</p>
      </div>
    );
  }
  if (!patient) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Dossier Patient</h1>
        <p className="text-sm text-gray-600">Patient introuvable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dossier Patient</h1>
      <div className="rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nom</p>
            <p className="text-base">{patient.last_name} {patient.first_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Contact</p>
            <p className="text-base">{patient.email || "—"} / {patient.phone || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date de naissance</p>
            <p className="text-base">{patient.dob || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Genre</p>
            <p className="text-base">{patient.gender || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Groupe sanguin</p>
            <p className="text-base">{patient.blood_type || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Utilisateur lié</p>
            <p className="text-base">{patient.user_id ? patient.user_id : "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Géré par staff</p>
            <p className="text-base">{patient.managed_by_staff ? "oui" : "non"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Créé / Mis à jour</p>
            <p className="text-base">{new Date(patient.created_at).toLocaleString()} / {patient.updated_at ? new Date(patient.updated_at).toLocaleString() : "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

